/* ============================================================
   Math Skills Tree — Application
   Touch-friendly pan/zoom, progress tracking, SVG connections
   ============================================================ */

(function () {
  "use strict";

  // ── Constants ──
  const STORAGE_KEY = "mathskills_progress";
  const MIN_ZOOM = 0.15;
  const MAX_ZOOM = 2.5;
  const ZOOM_STEP = 0.15;
  const NODE_PADDING_X = 80; // canvas padding
  const NODE_PADDING_Y = 80;

  // ── State ──
  let zoom = 1;
  let panX = 0, panY = 0;
  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  let panStartX = 0, panStartY = 0;
  let activeNodeId = null;
  let progress = {}; // { courseId: { topicIndex: true } }
  let nodeElements = {}; // { courseId: domElement }
  let courseMap = {}; // { courseId: courseData }

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

  // ── Init ──
  loadProgress();
  buildTree();
  drawConnections();
  updateGlobalProgress();
  fitToScreen();

  // ── Controls ──
  document.getElementById("btn-zoom-in").addEventListener("click", () => changeZoom(ZOOM_STEP));
  document.getElementById("btn-zoom-out").addEventListener("click", () => changeZoom(-ZOOM_STEP));
  document.getElementById("btn-fit").addEventListener("click", fitToScreen);
  document.getElementById("btn-reset").addEventListener("click", resetProgress);
  panelClose.addEventListener("click", closePanel);

  // close panel when clicking viewport (but not when dragging)
  viewport.addEventListener("click", (e) => {
    if (e.target === viewport || e.target === canvas || e.target.tagName === "svg") {
      closePanel();
    }
  });

  // ── Keyboard shortcuts ──
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
    if (e.key === "+" || e.key === "=") changeZoom(ZOOM_STEP);
    if (e.key === "-") changeZoom(-ZOOM_STEP);
    if (e.key === "0") fitToScreen();
  });

  // ════════════════════════════════════════════════════
  // Build the node tree on the canvas
  // ════════════════════════════════════════════════════
  function buildTree() {
    MATH_DATA.forEach((course, i) => {
      courseMap[course.id] = course;
    });

    MATH_DATA.forEach((course, i) => {
      const node = document.createElement("div");
      node.className = "skill-node";
      node.dataset.id = course.id;
      node.style.animationDelay = `${i * 0.04}s`;

      // Position
      const px = NODE_PADDING_X + course.x * getGapX();
      const py = NODE_PADDING_Y + course.y * getGapY();
      node.style.left = px + "px";
      node.style.top = py + "px";

      // Status
      const status = getCourseStatus(course);
      node.classList.add(status);

      // Inner HTML
      const done = getCompletedCount(course.id);
      const total = course.topics.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      node.innerHTML = `
        <div class="node-status"></div>
        <div class="node-header">
          <div class="node-icon">${course.icon}</div>
          <div>
            <div class="node-title">${course.name}</div>
            <div class="node-subtitle">${done}/${total} topics</div>
          </div>
        </div>
        <div class="node-progress-bar">
          <div class="node-progress-fill" style="width:${pct}%; background:${course.color}"></div>
        </div>
      `;

      node.addEventListener("click", (e) => {
        e.stopPropagation();
        openPanel(course.id);
      });

      nodesEl.appendChild(node);
      nodeElements[course.id] = node;
    });
  }

  function getGapX() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--node-gap-x')) || 260;
  }

  function getGapY() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--node-gap-y')) || 120;
  }

  function getNodeW() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--node-w')) || 180;
  }

  // ════════════════════════════════════════════════════
  // SVG connections between nodes
  // ════════════════════════════════════════════════════
  function drawConnections() {
    svgEl.innerHTML = "";
    const gapX = getGapX();
    const gapY = getGapY();
    const nodeW = getNodeW();
    const nodeH = 80; // approximate

    MATH_DATA.forEach((course) => {
      if (!course.prereqs) return;
      const toX = NODE_PADDING_X + course.x * gapX + nodeW / 2;
      const toY = NODE_PADDING_Y + course.y * gapY;

      course.prereqs.forEach((prereqId) => {
        const prereq = courseMap[prereqId];
        if (!prereq) return;
        const fromX = NODE_PADDING_X + prereq.x * gapX + nodeW / 2;
        const fromY = NODE_PADDING_Y + prereq.y * gapY + nodeH;

        // Curved path
        const midY = (fromY + toY) / 2;
        const d = `M${fromX},${fromY} C${fromX},${midY} ${toX},${midY} ${toX},${toY}`;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.classList.add("conn-line");

        // Color based on status
        const prereqStatus = getCourseStatus(prereq);
        const myStatus = getCourseStatus(course);
        if (prereqStatus === "completed") path.classList.add("completed");
        else if (myStatus === "unlocked" || myStatus === "in-progress") path.classList.add("unlocked");

        svgEl.appendChild(path);
      });
    });

    // Resize SVG to cover all
    const maxX = Math.max(...MATH_DATA.map(c => NODE_PADDING_X + c.x * gapX + nodeW)) + 100;
    const maxY = Math.max(...MATH_DATA.map(c => NODE_PADDING_Y + c.y * gapY + nodeH)) + 100;
    svgEl.setAttribute("width", maxX);
    svgEl.setAttribute("height", maxY);
  }

  // ════════════════════════════════════════════════════
  // Detail Panel
  // ════════════════════════════════════════════════════
  function openPanel(courseId) {
    const course = courseMap[courseId];
    if (!course) return;

    // Deselect previous
    if (activeNodeId && nodeElements[activeNodeId]) {
      nodeElements[activeNodeId].classList.remove("active");
    }
    activeNodeId = courseId;
    if (nodeElements[courseId]) {
      nodeElements[courseId].classList.add("active");
    }

    panelIcon.textContent = course.icon;
    panelTitle.textContent = course.name;
    updatePanelBadge(course);

    panelBody.innerHTML = "";
    course.topics.forEach((topic, idx) => {
      const isDone = isTopicDone(courseId, idx);
      const item = document.createElement("div");
      item.className = "topic-item" + (isDone ? " done" : "");
      item.innerHTML = `
        <div class="topic-check">✓</div>
        <div class="topic-name">${topic.name}</div>
      `;

      item.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleTopic(courseId, idx);
        item.classList.toggle("done");
        updateNodeDisplay(courseId);
        updatePanelBadge(course);
        updateGlobalProgress();
        drawConnections(); // re-color lines
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

    // Check prerequisites — if all prereqs completed, unlock
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
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    // Update classes
    node.classList.remove("locked", "unlocked", "completed", "in-progress");
    node.classList.add(getCourseStatus(course));

    // Update text
    const subtitle = node.querySelector(".node-subtitle");
    if (subtitle) subtitle.textContent = `${done}/${total} topics`;

    const fill = node.querySelector(".node-progress-fill");
    if (fill) fill.style.width = pct + "%";

    // Also update dependents
    MATH_DATA.forEach((c) => {
      if (c.prereqs && c.prereqs.includes(courseId)) {
        const depNode = nodeElements[c.id];
        if (!depNode) return;
        const status = getCourseStatus(c);
        depNode.classList.remove("locked", "unlocked", "completed", "in-progress");
        depNode.classList.add(status);
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
    } catch (e) { /* quota exceeded, oh well */ }
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
    // Refresh display
    MATH_DATA.forEach((c) => updateNodeDisplay(c.id));
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
      // Zoom towards the point
      panX = centerX - (centerX - panX) * (zoom / oldZoom);
      panY = centerY - (centerY - panY) * (zoom / oldZoom);
    }
    applyTransform();
  }

  function fitToScreen() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const gapX = getGapX();
    const gapY = getGapY();
    const nodeW = getNodeW();

    const maxX = Math.max(...MATH_DATA.map(c => c.x)) * gapX + nodeW + NODE_PADDING_X * 2;
    const maxY = Math.max(...MATH_DATA.map(c => c.y)) * gapY + 100 + NODE_PADDING_Y * 2;

    const scaleX = vw / maxX;
    const scaleY = vh / maxY;
    zoom = Math.min(scaleX, scaleY, 1) * 0.9;
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));

    panX = (vw - maxX * zoom) / 2;
    panY = (vh - maxY * zoom) / 2;
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
    // Zoom towards mouse
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

        // Also pan with pinch center movement
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
    if (e.touches.length < 2) {
      lastPinchDist = null;
    }
    if (e.touches.length === 0) {
      isDragging = false;
    }
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
