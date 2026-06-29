/* ============================================================
   Math Skills Tree — Application
   RPG-style skill tree: bottom → top, circular nodes, 
   glowing spline connections, color-coded branches.
   ============================================================ */

(function () {
  "use strict";

  // ── Constants ──
  const STORAGE_KEY = "mathskills_progress";
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 3;
  const ZOOM_STEP = 0.15;
  const NODE_PADDING_X = 120;
  const NODE_PADDING_Y = 100;

  // ── State ──
  let zoom = 1;
  let panX = 0, panY = 0;
  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  let panStartX = 0, panStartY = 0;
  let activeNodeId = null;
  let progress = {};
  let nodeElements = {};
  let courseMap = {};

  // Pinch zoom state
  let lastPinchDist = null;
  let lastPinchMidX = 0;
  let lastPinchMidY = 0;

  // ── DOM refs ──
  const viewport = document.getElementById("viewport");
  const canvas = document.getElementById("canvas");
  const svgEl = document.getElementById("connections");
  const nodesEl = document.getElementById("nodes");
  const panelEl = document.getElementById("detail-panel");
  const panelIcon = document.getElementById("panel-icon");
  const panelTitle = document.getElementById("panel-title");
  const panelBadge = document.getElementById("panel-badge");
  const panelBody = document.getElementById("panel-body");
  const panelClose = document.getElementById("panel-close");
  const globalFill = document.getElementById("global-progress-fill");
  const globalText = document.getElementById("global-progress-text");

  // ── Helpers ──
  function getNodeSize() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--node-size')) || 72;
  }
  function getGapX() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--node-gap-x')) || 140;
  }
  function getGapY() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--node-gap-y')) || 110;
  }

  // Find the max Y in data (so we can invert for bottom-to-top)
  const maxDataY = Math.max(...MATH_DATA.map(c => c.y));

  // Convert data y to canvas y (flip: y=0 at bottom, higher y goes up)
  function toCanvasY(dataY) {
    return (maxDataY - dataY) * getGapY() + NODE_PADDING_Y;
  }
  function toCanvasX(dataX) {
    return dataX * getGapX() + NODE_PADDING_X;
  }

  // Get branch color
  function getBranchColor(course) {
    return BRANCH_COLORS[course.branch] || BRANCH_COLORS.foundations;
  }

  // ── Init ──
  async function init() {
    let profileData = null;
    const qs = window.location.search.substring(1);
    
    if (qs) {
      try {
        const res = await fetch('profiles.json');
        const profiles = await res.json();
        if (profiles[qs]) {
          profileData = profiles[qs];
        }
      } catch (e) {
        console.error("Failed to load profiles.json", e);
      }
    }

    if (profileData && profileData.progress) {
      progress = profileData.progress;
      saveProgress();
    } else {
      loadProgress();
    }

    buildTree();
    drawConnections();
    updateGlobalProgress();

    requestAnimationFrame(() => {
      if (profileData && profileData.focus) {
        focusNode(profileData.focus, profileData.zoom || 1);
        openPanel(profileData.focus);
      } else {
        // Default zoom: start at bottom with reasonable zoom
        focusNode("early-math-review", 0.85);
      }
    });
  }
  init();

  // ── Controls ──
  document.getElementById("btn-zoom-in").addEventListener("click", () => changeZoom(ZOOM_STEP));
  document.getElementById("btn-zoom-out").addEventListener("click", () => changeZoom(-ZOOM_STEP));
  document.getElementById("btn-fit").addEventListener("click", fitToScreen);
  document.getElementById("btn-reset").addEventListener("click", resetProgress);
  panelClose.addEventListener("click", closePanel);

  viewport.addEventListener("click", (e) => {
    if (e.target === viewport || e.target === canvas || e.target.tagName === "svg") {
      closePanel();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
    if (e.key === "+" || e.key === "=") changeZoom(ZOOM_STEP);
    if (e.key === "-") changeZoom(-ZOOM_STEP);
    if (e.key === "0") fitToScreen();
  });

  // ════════════════════════════════════════════════════
  // Build circular nodes
  // ════════════════════════════════════════════════════
  function buildTree() {
    MATH_DATA.forEach((course) => {
      courseMap[course.id] = course;
    });

    MATH_DATA.forEach((course, i) => {
      const node = document.createElement("div");
      node.className = "skill-node";
      node.dataset.id = course.id;
      node.style.animationDelay = `${i * 0.05}s`;

      // Position (bottom-to-top)
      const px = toCanvasX(course.x);
      const py = toCanvasY(course.y);
      node.style.left = px + "px";
      node.style.top = py + "px";

      // Status
      const status = getCourseStatus(course);
      node.classList.add(status);

      // Branch color
      const branchColor = getBranchColor(course);
      const done = getCompletedCount(course.id);
      const total = course.topics.length;
      const pct = total > 0 ? done / total : 0;
      const circumference = Math.PI * 2 * 33; // radius 33 for SVG ring
      const dashOffset = circumference * (1 - pct);

      // Build node HTML
      node.innerHTML = `
        <div class="node-ring" style="border-color: ${status !== 'locked' ? branchColor.main + '33' : 'transparent'}"></div>
        <svg class="progress-ring" viewBox="0 0 72 72">
          <circle class="progress-ring-bg" cx="36" cy="36" r="33"/>
          <circle class="progress-ring-fill" cx="36" cy="36" r="33"
            style="stroke: ${branchColor.main}; stroke-dasharray: ${circumference}; stroke-dashoffset: ${dashOffset}"
          />
        </svg>
        <div class="node-circle" style="
          border-color: ${status !== 'locked' ? branchColor.main + '55' : 'rgba(255,255,255,0.04)'};
          ${status === 'completed' ? 'box-shadow: inset 0 0 20px ' + branchColor.bg + ', 0 0 30px ' + branchColor.glow + ';' : ''}
          ${status === 'in-progress' ? 'box-shadow: inset 0 0 15px ' + branchColor.bg + ';' : ''}
        ">
          <span class="node-icon">${course.icon}</span>
        </div>
        <div class="node-label" style="color: ${status !== 'locked' ? branchColor.main : 'var(--text-muted)'}">${course.name}</div>
        <div class="node-badge" style="background: ${status !== 'locked' ? branchColor.main : 'var(--text-muted)'}; color: ${status === 'locked' ? 'var(--bg)' : '#fff'}">${done}/${total}</div>
      `;

      // Hover glow effect
      node.addEventListener("mouseenter", () => {
        if (!node.classList.contains("locked")) {
          node.querySelector(".node-circle").style.boxShadow = 
            `inset 0 0 20px ${branchColor.bg}, 0 0 35px ${branchColor.glow}`;
        }
      });
      node.addEventListener("mouseleave", () => {
        if (!node.classList.contains("active")) {
          updateNodeGlow(course.id);
        }
      });

      node.addEventListener("click", (e) => {
        e.stopPropagation();
        openPanel(course.id);
      });

      nodesEl.appendChild(node);
      nodeElements[course.id] = node;
    });
  }

  function updateNodeGlow(courseId) {
    const course = courseMap[courseId];
    const node = nodeElements[courseId];
    if (!course || !node) return;
    const status = getCourseStatus(course);
    const bc = getBranchColor(course);
    const circle = node.querySelector(".node-circle");
    if (!circle) return;

    if (status === 'completed') {
      circle.style.boxShadow = `inset 0 0 20px ${bc.bg}, 0 0 30px ${bc.glow}`;
    } else if (status === 'in-progress') {
      circle.style.boxShadow = `inset 0 0 15px ${bc.bg}`;
    } else {
      circle.style.boxShadow = '';
    }
  }

  // ════════════════════════════════════════════════════
  // SVG connections — thick glowing splines
  // ════════════════════════════════════════════════════
  function drawConnections() {
    svgEl.innerHTML = "";
    const nodeSize = getNodeSize();
    const halfNode = nodeSize / 2;

    // Create defs for filters
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    
    // Glow filter
    const glowFilter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    glowFilter.setAttribute("id", "conn-glow-filter");
    glowFilter.setAttribute("x", "-50%");
    glowFilter.setAttribute("y", "-50%");
    glowFilter.setAttribute("width", "200%");
    glowFilter.setAttribute("height", "200%");
    const feGlow = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
    feGlow.setAttribute("stdDeviation", "6");
    feGlow.setAttribute("result", "glow");
    glowFilter.appendChild(feGlow);
    const feMerge = document.createElementNS("http://www.w3.org/2000/svg", "feMerge");
    const feMerge1 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
    feMerge1.setAttribute("in", "glow");
    const feMerge2 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
    feMerge2.setAttribute("in", "SourceGraphic");
    feMerge.appendChild(feMerge1);
    feMerge.appendChild(feMerge2);
    glowFilter.appendChild(feMerge);
    defs.appendChild(glowFilter);
    svgEl.appendChild(defs);

    MATH_DATA.forEach((course) => {
      if (!course.prereqs || !course.prereqs.length) return;

      const toX = toCanvasX(course.x) + halfNode;
      const toY = toCanvasY(course.y) + halfNode;

      course.prereqs.forEach((prereqId) => {
        const prereq = courseMap[prereqId];
        if (!prereq) return;

        const fromX = toCanvasX(prereq.x) + halfNode;
        const fromY = toCanvasY(prereq.y) + halfNode;

        // Determine branch color — use the target course's branch
        const bc = getBranchColor(course);
        const prereqBc = getBranchColor(prereq);

        // Connection status
        const prereqStatus = getCourseStatus(prereq);
        const myStatus = getCourseStatus(course);
        let connStatus = "locked";
        if (prereqStatus === "completed") connStatus = "completed";
        else if (myStatus === "unlocked" || myStatus === "in-progress") connStatus = "unlocked";
        else if (myStatus === "in-progress") connStatus = "in-progress";

        // Create smooth S-curve spline
        // Since tree goes bottom → top, fromY > toY (prereqs are below)
        const dy = fromY - toY;
        const dx = toX - fromX;
        const curveStrength = Math.max(Math.abs(dy) * 0.4, 40);

        let d;
        if (Math.abs(dx) < 10) {
          // Vertical connection — simple bezier
          d = `M${fromX},${fromY} C${fromX},${fromY - curveStrength} ${toX},${toY + curveStrength} ${toX},${toY}`;
        } else {
          // Diagonal — elegant S-curve
          const midY = (fromY + toY) / 2;
          d = `M${fromX},${fromY} C${fromX},${midY} ${toX},${midY} ${toX},${toY}`;
        }

        // Background glow layer
        const glowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        glowPath.setAttribute("d", d);
        glowPath.setAttribute("fill", "none");
        glowPath.setAttribute("stroke", connStatus !== "locked" ? bc.main : "rgba(255,255,255,0.03)");
        glowPath.setAttribute("stroke-width", connStatus === "completed" ? "14" : "10");
        glowPath.setAttribute("stroke-linecap", "round");
        glowPath.setAttribute("opacity", connStatus === "completed" ? "0.12" : connStatus === "unlocked" ? "0.06" : "0.02");
        if (connStatus !== "locked") {
          glowPath.setAttribute("filter", "url(#conn-glow-filter)");
        }
        svgEl.appendChild(glowPath);

        // Main connection line  
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-linecap", "round");

        if (connStatus === "completed") {
          path.setAttribute("stroke", bc.main);
          path.setAttribute("stroke-width", "4");
          path.setAttribute("opacity", "0.85");
        } else if (connStatus === "unlocked" || connStatus === "in-progress") {
          path.setAttribute("stroke", bc.main);
          path.setAttribute("stroke-width", "3");
          path.setAttribute("opacity", "0.45");
          path.setAttribute("stroke-dasharray", "8 6");
        } else {
          path.setAttribute("stroke", "rgba(255,255,255,0.08)");
          path.setAttribute("stroke-width", "2");
          path.setAttribute("opacity", "0.5");
        }

        svgEl.appendChild(path);

        // Animated dot along completed connections
        if (connStatus === "completed") {
          const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          dot.setAttribute("r", "4");
          dot.setAttribute("fill", bc.main);
          dot.setAttribute("opacity", "0.7");
          dot.setAttribute("filter", "url(#conn-glow-filter)");
          
          const animMotion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
          animMotion.setAttribute("dur", `${3 + Math.random() * 2}s`);
          animMotion.setAttribute("repeatCount", "indefinite");
          animMotion.setAttribute("path", d);
          
          const animOpacity = document.createElementNS("http://www.w3.org/2000/svg", "animate");
          animOpacity.setAttribute("attributeName", "opacity");
          animOpacity.setAttribute("values", "0;0.7;0.7;0");
          animOpacity.setAttribute("dur", `${3 + Math.random() * 2}s`);
          animOpacity.setAttribute("repeatCount", "indefinite");
          
          dot.appendChild(animMotion);
          dot.appendChild(animOpacity);
          svgEl.appendChild(dot);
        }

        // Small junction dots at connection endpoints
        if (connStatus !== "locked") {
          // Dot at from point
          const fromDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          fromDot.setAttribute("cx", fromX);
          fromDot.setAttribute("cy", fromY);
          fromDot.setAttribute("r", connStatus === "completed" ? "4" : "3");
          fromDot.setAttribute("fill", prereqBc.main);
          fromDot.setAttribute("opacity", connStatus === "completed" ? "0.6" : "0.3");
          svgEl.appendChild(fromDot);

          // Dot at to point
          const toDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
          toDot.setAttribute("cx", toX);
          toDot.setAttribute("cy", toY);
          toDot.setAttribute("r", connStatus === "completed" ? "4" : "3");
          toDot.setAttribute("fill", bc.main);
          toDot.setAttribute("opacity", connStatus === "completed" ? "0.6" : "0.3");
          svgEl.appendChild(toDot);
        }
      });
    });

    // Resize SVG to cover all
    const allX = MATH_DATA.map(c => toCanvasX(c.x) + nodeSize);
    const allY = MATH_DATA.map(c => toCanvasY(c.y) + nodeSize);
    const maxX = Math.max(...allX) + 150;
    const maxY = Math.max(...allY) + 150;
    svgEl.setAttribute("width", maxX);
    svgEl.setAttribute("height", maxY);
  }

  // ════════════════════════════════════════════════════
  // Detail Panel
  // ════════════════════════════════════════════════════
  function openPanel(courseId) {
    const course = courseMap[courseId];
    if (!course) return;

    if (activeNodeId && nodeElements[activeNodeId]) {
      nodeElements[activeNodeId].classList.remove("active");
    }
    activeNodeId = courseId;
    if (nodeElements[courseId]) {
      nodeElements[courseId].classList.add("active");
    }

    const bc = getBranchColor(course);
    panelIcon.textContent = course.icon;
    panelIcon.style.background = bc.bg;
    panelIcon.style.boxShadow = `0 0 20px ${bc.glow}`;
    panelTitle.textContent = course.name;
    panelTitle.style.color = bc.main;
    updatePanelBadge(course);

    panelBody.innerHTML = "";
    course.topics.forEach((topic, idx) => {
      const isDone = isTopicDone(courseId, idx);
      const item = document.createElement("div");
      item.className = "topic-item" + (isDone ? " done" : "");
      item.innerHTML = `
        <div class="topic-check" style="${isDone ? 'border-color:' + bc.main + ';background:' + bc.main + ';' : ''}">✓</div>
        <div class="topic-name">${topic.name}</div>
      `;

      item.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleTopic(courseId, idx);
        item.classList.toggle("done");
        const check = item.querySelector(".topic-check");
        if (item.classList.contains("done")) {
          check.style.borderColor = bc.main;
          check.style.background = bc.main;
        } else {
          check.style.borderColor = '';
          check.style.background = '';
        }
        updateNodeDisplay(courseId);
        updatePanelBadge(course);
        updateGlobalProgress();
        drawConnections();
        saveProgress();
      });

      panelBody.appendChild(item);
    });

    panelEl.classList.remove("hidden");
  }

  function closePanel() {
    panelEl.classList.add("hidden");
    if (activeNodeId && nodeElements[activeNodeId]) {
      nodeElements[activeNodeId].classList.remove("active");
      updateNodeGlow(activeNodeId);
    }
    activeNodeId = null;
  }

  function updatePanelBadge(course) {
    const done = getCompletedCount(course.id);
    const total = course.topics.length;
    panelBadge.textContent = `${done} / ${total} completed`;
  }

  // ════════════════════════════════════════════════════
  // Progress tracking
  // ════════════════════════════════════════════════════
  function isTopicDone(courseId, topicIdx) {
    return !!(progress[courseId] && progress[courseId][topicIdx]);
  }

  function toggleTopic(courseId, topicIdx) {
    if (!progress[courseId]) progress[courseId] = {};
    progress[courseId][topicIdx] = !progress[courseId][topicIdx];
    if (!progress[courseId][topicIdx]) delete progress[courseId][topicIdx];
    if (Object.keys(progress[courseId]).length === 0) delete progress[courseId];
  }

  function getCompletedCount(courseId) {
    if (!progress[courseId]) return 0;
    return Object.keys(progress[courseId]).length;
  }

  function getCourseStatus(course) {
    const done = getCompletedCount(course.id);
    const total = course.topics.length;
    if (done >= total && total > 0) return "completed";
    if (done > 0) return "in-progress";
    if (!course.prereqs || course.prereqs.length === 0) return "unlocked";
    const allPrereqsDone = course.prereqs.every((pid) => {
      const p = courseMap[pid];
      return p && getCompletedCount(pid) >= p.topics.length;
    });
    return allPrereqsDone ? "unlocked" : "locked";
  }

  function updateNodeDisplay(courseId) {
    const course = courseMap[courseId];
    const node = nodeElements[courseId];
    if (!course || !node) return;

    const done = getCompletedCount(courseId);
    const total = course.topics.length;
    const pct = total > 0 ? done / total : 0;
    const status = getCourseStatus(course);
    const bc = getBranchColor(course);

    // Update classes
    node.classList.remove("locked", "unlocked", "completed", "in-progress");
    node.classList.add(status);

    // Update progress ring
    const circumference = Math.PI * 2 * 33;
    const dashOffset = circumference * (1 - pct);
    const ringFill = node.querySelector(".progress-ring-fill");
    if (ringFill) {
      ringFill.style.strokeDashoffset = dashOffset;
      ringFill.style.stroke = bc.main;
    }

    // Update badge
    const badge = node.querySelector(".node-badge");
    if (badge) {
      badge.textContent = `${done}/${total}`;
      badge.style.background = status !== 'locked' ? bc.main : 'var(--text-muted)';
    }

    // Update label color
    const label = node.querySelector(".node-label");
    if (label) {
      label.style.color = status !== 'locked' ? bc.main : 'var(--text-muted)';
    }

    // Update circle border and glow
    const circle = node.querySelector(".node-circle");
    if (circle) {
      circle.style.borderColor = status !== 'locked' ? bc.main + '55' : 'rgba(255,255,255,0.04)';
    }

    // Update ring
    const ring = node.querySelector(".node-ring");
    if (ring) {
      ring.style.borderColor = status !== 'locked' ? bc.main + '33' : 'transparent';
    }

    // Update glow
    updateNodeGlow(courseId);

    // Update dependents
    MATH_DATA.forEach((c) => {
      if (c.prereqs && c.prereqs.includes(courseId)) {
        updateNodeDisplay(c.id);
      }
    });
  }

  function updateGlobalProgress() {
    let totalTopics = 0, doneTopics = 0;
    MATH_DATA.forEach((c) => {
      totalTopics += c.topics.length;
      doneTopics += getCompletedCount(c.id);
    });
    const pct = totalTopics > 0 ? (doneTopics / totalTopics) * 100 : 0;
    globalFill.style.width = pct + "%";
    globalText.textContent = `${doneTopics} / ${totalTopics} topics`;
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) { }
  }

  function loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) progress = JSON.parse(saved);
    } catch (e) { progress = {}; }
  }

  function resetProgress() {
    if (!confirm("Reset all progress? This cannot be undone.")) return;
    progress = {};
    saveProgress();
    // Full rebuild for clean state
    nodesEl.innerHTML = "";
    nodeElements = {};
    buildTree();
    drawConnections();
    updateGlobalProgress();
    if (activeNodeId) openPanel(activeNodeId);
  }

  // ════════════════════════════════════════════════════
  // Pan & Zoom
  // ════════════════════════════════════════════════════
  function applyTransform() {
    canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
  }

  function changeZoom(delta, centerX, centerY) {
    const oldZoom = zoom;
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));
    if (centerX !== undefined && centerY !== undefined) {
      panX = centerX - (centerX - panX) * (zoom / oldZoom);
      panY = centerY - (centerY - panY) * (zoom / oldZoom);
    }
    applyTransform();
  }

  function focusNode(courseId, customZoom = 1) {
    const course = courseMap[courseId];
    if (!course) return;

    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, customZoom));
    const nodeSize = getNodeSize();
    const px = toCanvasX(course.x) + nodeSize / 2;
    const py = toCanvasY(course.y) + nodeSize / 2;

    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;

    panX = (vw / 2) - (px * zoom);
    panY = (vh / 2) - (py * zoom);
    
    applyTransform();
  }

  function fitToScreen() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const nodeSize = getNodeSize();

    // Calculate bounds of the tree
    const positions = MATH_DATA.map(c => ({
      x: toCanvasX(c.x),
      y: toCanvasY(c.y)
    }));
    const minPosX = Math.min(...positions.map(p => p.x));
    const maxPosX = Math.max(...positions.map(p => p.x)) + nodeSize + 120;
    const minPosY = Math.min(...positions.map(p => p.y));
    const maxPosY = Math.max(...positions.map(p => p.y)) + nodeSize + 80;

    const treeW = maxPosX - minPosX + NODE_PADDING_X;
    const treeH = maxPosY - minPosY + NODE_PADDING_Y;

    const scaleX = vw / treeW;
    const scaleY = vh / treeH;
    zoom = Math.min(scaleX, scaleY, 1) * 0.85;
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));

    panX = (vw - treeW * zoom) / 2;
    panY = (vh - treeH * zoom) / 2;
    applyTransform();
  }

  // ── Mouse drag ──
  viewport.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    panStartX = panX;
    panStartY = panY;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    panX = panStartX + (e.clientX - dragStartX);
    panY = panStartY + (e.clientY - dragStartY);
    applyTransform();
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // ── Mouse wheel zoom ──
  viewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = viewport.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const delta = -Math.sign(e.deltaY) * ZOOM_STEP;
    const oldZoom = zoom;
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));
    panX = cx - (cx - panX) * (zoom / oldZoom);
    panY = cy - (cy - panY) * (zoom / oldZoom);
    applyTransform();
  }, { passive: false });

  // ── Touch support ──
  viewport.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      dragStartX = e.touches[0].clientX;
      dragStartY = e.touches[0].clientY;
      panStartX = panX;
      panStartY = panY;
    } else if (e.touches.length === 2) {
      isDragging = false;
      lastPinchDist = getPinchDist(e.touches);
      const mid = getPinchMid(e.touches);
      lastPinchMidX = mid.x;
      lastPinchMidY = mid.y;
    }
  }, { passive: true });

  viewport.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      panX = panStartX + (e.touches[0].clientX - dragStartX);
      panY = panStartY + (e.touches[0].clientY - dragStartY);
      applyTransform();
    } else if (e.touches.length === 2) {
      const dist = getPinchDist(e.touches);
      const mid = getPinchMid(e.touches);
      if (lastPinchDist !== null) {
        const scale = dist / lastPinchDist;
        const oldZoom = zoom;
        zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * scale));
        const rect = viewport.getBoundingClientRect();
        const cx = mid.x - rect.left;
        const cy = mid.y - rect.top;
        panX = cx - (cx - panX) * (zoom / oldZoom);
        panY = cy - (cy - panY) * (zoom / oldZoom);
        panX += mid.x - lastPinchMidX;
        panY += mid.y - lastPinchMidY;
        applyTransform();
      }
      lastPinchDist = dist;
      lastPinchMidX = mid.x;
      lastPinchMidY = mid.y;
    }
  }, { passive: false });

  viewport.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) lastPinchDist = null;
    if (e.touches.length === 0) isDragging = false;
  }, { passive: true });

  function getPinchDist(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getPinchMid(touches) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  }

  // ── Resize handler ──
  window.addEventListener("resize", () => {
    drawConnections();
  });

})();
