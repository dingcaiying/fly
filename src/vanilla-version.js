/*
 * jquery.fly
 *
 * 抛物线动画
 * @github https://github.com/amibug/fly
 * Copyright (c) 2014 wuyuedong
 * copy from tmall.com
 */

/*
  * Update
  * 移除了jQuery依赖的版本，直接import，然后调用 fly(flyIconEl, {})
*/
function fly(element, options) {
  // 默认值
  var defaults = {
    version: "1.0.0",
    autoPlay: true,
    vertex_Rtop: 20, // 默认顶点高度top值
    speed: 1.2,
    start: {}, // top, left, width, height
    end: {},
    onEnd: () => {}
  };

  var self = {},
    $element = element; // Caiying: removed jQuery wrapper function

  /**
   * 初始化组件，new的时候即调用
   */
  self.init = function(options) {
    self.setOptions(options);
    !!self.settings.autoPlay && self.play();
  };

  /**
   * 设置组件参数
   */
  self.setOptions = function(options) {
    self.settings = Object.assign({}, defaults, options);
    var settings = self.settings,
      start = settings.start,
      end = settings.end;

    $element.style.marginTop = "0px";
    $element.style.marginLeft = "0px";
    $element.style.position = "fixed";
    document.body.appendChild($element);
    // 运动过程中有改变大小
    if (end.width != null && end.height != null) {
      Object.assign(start, {
        width: $element.clientWidth,
        height: $element.clientHeight
      });
    }
    // 运动轨迹最高点top值
    var vertex_top =
      Math.min(start.top, end.top) - Math.abs(start.left - end.left) / 3;
    if (vertex_top < settings.vertex_Rtop) {
      // 可能出现起点或者终点就是运动曲线顶点的情况
      vertex_top = Math.min(settings.vertex_Rtop, Math.min(start.top, end.top));
    }

    /**
     * ======================================================
     * 运动轨迹在页面中的top值可以抽象成函数 y = a * x*x + b;
     * a = curvature
     * b = vertex_top
     * ======================================================
     */

    var distance = Math.sqrt(
        Math.pow(start.top - end.top, 2) + Math.pow(start.left - end.left, 2)
      ),
      // 元素移动次数
      steps = Math.ceil(
        Math.min(Math.max(Math.log(distance) / 0.05 - 75, 30), 100) /
          settings.speed
      ),
      ratio =
        start.top == vertex_top
          ? 0
          : -Math.sqrt((end.top - vertex_top) / (start.top - vertex_top)),
      vertex_left = (ratio * start.left - end.left) / (ratio - 1),
      // 特殊情况，出现顶点left==终点left，将曲率设置为0，做直线运动。
      curvature =
        end.left == vertex_left
          ? 0
          : (end.top - vertex_top) / Math.pow(end.left - vertex_left, 2);

    Object.assign(settings, {
      count: -1, // 每次重置为-1
      steps: steps,
      vertex_left: vertex_left,
      vertex_top: vertex_top,
      curvature: curvature
    });
  };

  /**
   * 开始运动，可自己调用
   */
  self.play = function() {
    self.move();
  };

  /**
   * 按step运动
   */
  self.move = function() {
    var settings = self.settings,
      start = settings.start,
      count = settings.count,
      steps = settings.steps,
      end = settings.end;
    // 计算left top值
    var left = start.left + ((end.left - start.left) * count) / steps,
      top =
        settings.curvature == 0
          ? start.top + ((end.top - start.top) * count) / steps
          : settings.curvature * Math.pow(left - settings.vertex_left, 2) +
            settings.vertex_top;
    // 运动过程中有改变大小
    if (end.width != null && end.height != null) {
      var i = steps / 2,
        width =
          end.width -
          (end.width - start.width) *
            Math.cos(
              count < i ? 0 : (((count - i) / (steps - i)) * Math.PI) / 2
            ),
        height =
          end.height -
          (end.height - start.height) *
            Math.cos(
              count < i ? 0 : (((count - i) / (steps - i)) * Math.PI) / 2
            );
      $element.style.width = width + "px";
      $element.style.height = height + "px";
      $element.style.fontSize = Math.min(width, height) + "px";
    }
    $element.style.left = left + "px";
    $element.style.top = top + "px";
    settings.count++;
    // 定时任务
    var time = window.requestAnimationFrame(self.move.bind(self));
    if (count == steps) {
      window.cancelAnimationFrame(time);
      // fire callback
      settings.onEnd.apply(self);
    }
  };

  /**
   * 销毁
   */
  // self.destroy = function() {
  //   $element.remove();
  // };

  self.init(options);
}

export default fly;
