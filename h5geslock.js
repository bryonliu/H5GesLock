"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Created by bryonliu on 2016/8/15.
 */

/***
 *
 */
var H5GesLock = function () {
    function H5GesLock(options) {
        _classCallCheck(this, H5GesLock);

        options = options || {};
        this.width = options.width || document.body.offsetWidth;
        this.height = options.height || this.width;
        this.R = options.R || this.width * 0.17 / 2;
        this.R_INNER = this.R * 0.3; //选中之后内圆的半径
        this.dy = options.type || 3; // 维度 默认是3*3
        this.offsetX = this.width * 0.145; //触摸点上下和左右的留白
        this.offsetY = this.width * 0.145;
        this.default_width_line = 1.5;
        this.default__width_touch_line = 1.5;
        this.touchSpots = caculateTouchSpotsLocation(this); // 屏幕上的所有点

        if (!options.container || !document.getElementById(options.container)) {
            throw new Error("please input right id of you canvas");
        }
        this.mContainer = document.getElementById(options.container);
        this.mContext = this.mContainer.getContext("2d");

        this.mContainer.width = this.width;
        this.mContainer.height = this.height;

        this.default_color = "#CCCCCC"; // 默认点边框颜色值

        this.default_touche_color = "#2D72F1"; //划线颜色
        this.default_touche_fill_color = "#B0C8F3"; // 选择点的填充颜色
        this.default_warn_touche_color = "#F95A5A"; //错误情况下划线颜色
        this.default_warn_touche_fill_color = "#F6BFBF"; // 错误情况下的选择点的填充颜色

        this.inputEnd = options.inputEnd;

        this.touchStartListener = touchStartHandler(this);
        this.touchMoveListenner = touchMoveHandler(this);
        this.touchEndListener = touchEndHandler(this);
        this.hasTouchedSpots = [];
    }

    _createClass(H5GesLock, [{
        key: "init",
        value: function init() {
            this.clear();
            this.hasTouchedSpots = [];
            drawDefaultSpots(this);
            bindEvent(this);
        }
    }, {
        key: "clear",
        value: function clear() {
            this.mContext.clearRect(0, 0, this.width, this.height);
        }
    }, {
        key: "drawWarn",
        value: function drawWarn() {
            this.clear();
            _drawWarn(this);
        }
    }]);

    return H5GesLock;
}();

window.H5GesLock = H5GesLock;
/**
 * 计算手势密码的N*N个位置
 * 3*3顺序依次为：
 *    1 2 3
 *    4 5 6
 *    7 8 9
 */
function caculateTouchSpotsLocation(H5Ges) {
    var spots = [];

    var X_Dis = (H5Ges.width - 2 * H5Ges.offsetX - 2 * H5Ges.R) / (H5Ges.dy - 1); // X 轴上的圆心距
    var Y_Dis = (H5Ges.height - 2 * H5Ges.offsetY - 2 * H5Ges.R) / (H5Ges.dy - 1); // Y 轴上的圆心距

    for (var row = 0; row < H5Ges.dy; row++) {
        for (var col = 0; col < H5Ges.dy; col++) {
            var point = {
                X: H5Ges.offsetX + H5Ges.R + col * X_Dis,
                Y: H5Ges.offsetY + H5Ges.R + row * Y_Dis
            };
            spots.push(point);
        }
    }
    return spots;
}

function drawNormal(h5ges, lastPoint) {

    drawDefaultSpots(h5ges);
    drawTouchSpots(h5ges, true);
    drawTouchLine(h5ges, true, lastPoint);
    drawTouchCenter(h5ges, true);
}
function _drawWarn(h5ges) {

    drawDefaultSpots(h5ges);
    drawTouchSpots(h5ges, false);
    drawTouchLine(h5ges, false, null);
    drawTouchCenter(h5ges, false);
}
/**
 * 选择点颜色填充
 * @param h5ges
 * @param isNormal 是正常选中还是警告
 */
function drawTouchSpots(h5ges, isNormal) {
    var mContext = h5ges.mContext;
    h5ges.hasTouchedSpots.forEach(function (spotIndex) {
        var spot = h5ges.touchSpots[spotIndex];
        mContext.beginPath();
        mContext.fillStyle = isNormal ? h5ges.default_touche_fill_color : h5ges.default_warn_touche_fill_color;
        mContext.arc(spot.X, spot.Y, h5ges.R, 0, Math.PI * 2);
        mContext.fill();
        mContext.closePath();
        mContext.stroke();
    });
}
/***
 *  绘初始化默认图
 * @param h5ges
 */
function drawDefaultSpots(h5ges) {

    var mContext = h5ges.mContext;
    h5ges.touchSpots.forEach(function (spot) {
        mContext.beginPath();
        mContext.lineWidth = h5ges.default_width_line;
        mContext.strokeStyle = h5ges.default_color;
        mContext.arc(spot.X, spot.Y, h5ges.R, 0, Math.PI * 2);
        mContext.closePath();
        mContext.stroke();
    });
}

/**
 * 绘制以选择点的中间小圆
 * @param mContext
 * @param touchSpots
 * @param color
 * @param allSpots
 */
function drawTouchCenter(h5ges, isNormal) {
    var mContext = h5ges.mContext;
    h5ges.hasTouchedSpots.forEach(function (spotIndex) {
        var spot = h5ges.touchSpots[spotIndex];
        mContext.beginPath();
        mContext.lineWidth = 1;
        mContext.fillStyle = isNormal ? h5ges.default_touche_color : h5ges.default_warn_touche_color;
        mContext.arc(spot.X, spot.Y, h5ges.R_INNER, 0, Math.PI * 2);
        mContext.fill();
        mContext.closePath();
        mContext.stroke();
    });
}
/**
 * 绘制一选择点以及当前触摸点的连线
 * @param h5ges
 * @param color
 * @param lastPoint
 */
function drawTouchLine(h5ges, isNormal, lastPoint) {

    var touchSpots = h5ges.hasTouchedSpots;

    if (!touchSpots || touchSpots.length == 0) return;
    h5ges.mContext.beginPath();
    touchSpots.forEach(function (spot) {
        h5ges.mContext.lineTo(h5ges.touchSpots[spot].X, h5ges.touchSpots[spot].Y);
    });
    h5ges.mContext.lineWidth = h5ges.default__width_touch_line;
    h5ges.mContext.strokeStyle = isNormal ? h5ges.default_touche_color : h5ges.default_warn_touche_color;
    h5ges.mContext.stroke();
    h5ges.mContext.closePath();
    var mContext = h5ges.mContext;

    if (lastPoint != null) {
        var lastTouchSpotIndex = touchSpots[touchSpots.length - 1];
        var lastSpot = h5ges.touchSpots[lastTouchSpotIndex];
        mContext.beginPath();
        mContext.moveTo(lastSpot.X, lastSpot.Y);
        mContext.lineTo(lastPoint.X, lastPoint.Y);
        mContext.stroke();
        mContext.closePath();
    }
}
function bindEvent(h5Ges) {

    h5Ges.mContainer.addEventListener("touchstart", h5Ges.touchStartListener, false);
    h5Ges.mContainer.addEventListener("touchmove", h5Ges.touchMoveListenner, false);
    h5Ges.mContainer.addEventListener("touchend", h5Ges.touchEndListener, false);
}
var touchStartHandler = function touchStartHandler(h5Ges) {
    return function (e) {
        var touche = e.touches[0];
        var touchPoint = { X: touche.pageX, Y: touche.pageY };
        isTouchSpot(h5Ges, touchPoint);
    };
};

var touchMoveHandler = function touchMoveHandler(h5Ges) {
    return function (e) {
        e.preventDefault();
        var touche = e.touches[0];
        var touchePoint = { X: touche.pageX, Y: touche.pageY };
        var istouch = isTouchSpot(h5Ges, touchePoint);
        pickSpotsOnLine(h5Ges.hasTouchedSpots, h5Ges.dy);
        h5Ges.clear();
        var lastPoint = istouch ? null : { X: touche.pageX, Y: touche.pageY };
        drawNormal(h5Ges, lastPoint);
    };
};
var touchEndHandler = function touchEndHandler(h5Ges) {
    return function (e) {
        h5Ges.clear();
        drawNormal(h5Ges, h5Ges.hasTouchedSpots);
        h5Ges.lastTouchSpots = h5Ges.hasTouchedSpots;

        if (h5Ges.inputEnd && typeof h5Ges.inputEnd == "function") {
            h5Ges.inputEnd(h5Ges.hasTouchedSpots.join(""));
        } else {
            console.log(h5Ges.hasTouchedSpots.join(""));
        }
        h5Ges.hasTouchedSpots = [];
        unbindEvent(h5Ges);
    };
};

function unbindEvent(h5Ges) {
    var mContainer = h5Ges.mContainer;
    mContainer.removeEventListener("touchstart", h5Ges.touchStartListener, false);
    mContainer.removeEventListener("touchmove", h5Ges.touchMoveListenner, false);
    mContainer.removeEventListener("touchend", h5Ges.touchEndListener, false);
}
/**
 * @brify 判断是否触摸到某个点以及是否已经被触摸过
 * @param h5ges
 * @param currentSpot
 * @returns {*|boolean}
 */
function isTouchSpot(h5ges, currentSpot) {
    return h5ges.touchSpots.some(function (spot, index) {
        var xDiff = spot.X - currentSpot.X;
        var yDiff = spot.Y - currentSpot.Y;
        var dir = Math.pow(xDiff * xDiff + yDiff * yDiff, 0.5);
        if (dir < h5ges.R & h5ges.hasTouchedSpots.indexOf(index) < 0) {
            h5ges.hasTouchedSpots.push(index);
            return true;
        }
    });
}
/**
 * 检查任意相邻两点直接是否有其他点，如果有者插入他们中间
 * @param touchedSpots
 * @param d
 */
function pickSpotsOnLine(touchedSpots, d) {

    for (var i = 0; i < touchedSpots.length - 1; i++) {

        var nums = numberOntheLineOf(touchedSpots[i], touchedSpots[i + 1], d);
        var last = i + 1;
        for (var k = 0; k < nums.length; k++) {
            if (touchedSpots.indexOf(nums[k]) == -1) {
                //console.log("has")
                touchedSpots.splice(last, 0, nums[k]);
                last += 1;
            }
        }
    }
}
/***
 * @brify 判断两个相连的数字在d*d宫格中的连线上是否有其他数字， 比如在九宫格中，0，2之间会有1
 * @param i 数字i
 * @param j 数字j
 * @param d 维度d(3*3,4*4)
 * @returns {Array}
 */
function numberOntheLineOf(i, j, d) {
    var result = [];
    if (i > j) {
        var t = i;
        i = j;
        j = t;
    }
    var ix = i % d,
        iy = parseInt(i / d);
    var jx = j % d,
        jy = parseInt(j / d);

    var dx = jx - ix,
        dy = jy - iy;

    if (dx != dy && dx != 0 && dy != 0) return result;

    //console.log("dx : dy = " + dx + " : " + dy);
    if (dx == dy) {
        var begin = d + 1 + i;
        while (begin < j) {
            result.push(begin);
            console.log(begin);
            begin += d + 1;
        }
    } else if (dx == 0) {
        var begin = i + d;
        while (begin < j) {
            result.push(begin);
            begin += d;
        }
    } else if (dy == 0) {

        var begin = i + 1;

        while (begin < j) {
            result.push(begin);
            begin += 1;
        }
    }
    return result;
}

//# sourceMappingURL=h5geslock.js.map