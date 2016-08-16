/**
 * Created by bryonliu on 2016/8/15.
 */
/*
 *类型 ： 输入密码
 *    ：  设置密码
 *
 * option={
 *   width {int}
 *   height {int},
 *   type {int} 3*3,4*4,5*5
 *   inputEnd {function}
 *  }
 * */

class H5Ges {

    constructor(options) {
        this.options = options || {};
        this.width = options.width || document.body.offsetWidth;
        this.height = options.height || 320;
        this.R = options.R || 25;
        this.dy = options.type || 3; // 维度 默认是3*3
        this.offsetX = 40; //触摸点上下和左右的留白
        this.offsetY = 40;
        this.touchSpots = caculateTouchSpotsLocation(this);
        if (!options.container || !document.getElementById(options.container)) {
            throw new Error("please input right id of you canvas");
        }
        this.mContainer = document.getElementById(options.container);
        this.mContext = this.mContainer.getContext("2d");

        this.mContainer.width = this.width;
        this.mContainer.height = this.height;
        this.default_color = "#C3E0C4"; // 默认绘图颜色值
        this.default_color_warn = "#C95B5A";//默认警告颜色值
        this.inputEnd = options.inputEnd;

        this.touchStartListener = touchStartHandler(this);
        this.touchMoveListenner = touchMoveHandler(this);
        this.touchEndListener = touchEndHandler(this);
    }

    init() {
        this.clear();
        this.hasTouchedSpots=[];
        drawTouchSpots(this);
        bindEvent(this);
    }

    clear() {
        this.mContext.clearRect(0, 0, this.width, this.height);
    }

    drawWarn() {
        this.clear();
        drawWarn(this, this.lastTouchSpots);
    }
}
window.H5Ges = H5Ges;
/**
 * 计算手势密码的N*N个位置
 * 3*3顺序依次为：
 *    1 2 3
 *    4 5 6
 *    7 8 9
 */
function caculateTouchSpotsLocation(H5Ges) {
    var spots = [];

    let X_Dis = (H5Ges.width - 2 * H5Ges.offsetX - 2 * H5Ges.R) / (H5Ges.dy - 1); // X 轴上的圆心距
    let Y_Dis = (H5Ges.height - 2 * H5Ges.offsetY - 2 * H5Ges.R) / (H5Ges.dy - 1); // Y 轴上的圆心距

    for (let row = 0; row < H5Ges.dy; row++) {
        for (let col = 0; col < H5Ges.dy; col++) {
            let point = {
                X: H5Ges.offsetX + H5Ges.R + col * X_Dis,
                Y: H5Ges.offsetY + H5Ges.R + row * Y_Dis
            }
            console.log("X = " + point.X + " Y = " + point.Y);
            spots.push(point);
        }
    }
    return spots;
}

function draw(h5ges, touchSpots, color, lastPoint) {
    dranTouchLine(h5ges.mContext, touchSpots, color, lastPoint, h5ges.touchSpots);
    drawTouchSpots(h5ges);
}
function drawNormal(h5ges, touchSpots, lastPoint) {
    draw(h5ges, touchSpots, h5ges.default_color, lastPoint);
}
function drawWarn(h5ges, touchSpots) {
    draw(h5ges, touchSpots, h5ges.default_color_warn, null, h5ges.touchSpots);
}
function drawTouchSpots(h5ges) {

    var mContext = h5ges.mContext;

    h5ges.touchSpots.forEach(function (spot) {
        mContext.beginPath();
        mContext.lineWidth = 2;
        mContext.strokeStyle = h5ges.default_color;
        mContext.arc(spot.X, spot.Y, h5ges.R, 0, Math.PI * 2);
        mContext.closePath();
        mContext.stroke();
    });
}

function drawTouchCenter(mContext, touchSpots, color, allSpots) {
    touchSpots.forEach(function (spotIndex) {
        var spot = allSpots[spotIndex];
        mContext.beginPath();
        mContext.lineWidth = 1;
        mContext.fillStyle = color;
        mContext.arc(spot.X, spot.Y, 10, 0, Math.PI * 2);
        mContext.fill();
        mContext.closePath();
        mContext.stroke();
    });
}
function dranTouchLine(mContext, touchSpots, color, lastPoint, allSpots) {

    if (!touchSpots || touchSpots.length == 0) return;
    mContext.beginPath();
    touchSpots.forEach(function (spot) {
        mContext.lineTo(allSpots[spot].X, allSpots[spot].Y);
    });
    mContext.lineWidth = 6;
    mContext.strokeStyle = color;
    mContext.stroke();
    mContext.closePath();

    if (lastPoint != null) {
        let lastTouchSpotIndex = touchSpots[touchSpots.length - 1];
        let lastSpot = allSpots[lastTouchSpotIndex];
        mContext.beginPath();
        mContext.moveTo(lastSpot.X, lastSpot.Y);
        mContext.lineTo(lastPoint.X, lastPoint.Y);
        mContext.stroke();
        mContext.closePath();
    }
    drawTouchCenter(mContext, touchSpots, color, allSpots);
}
function bindEvent(h5Ges) {

    h5Ges.mContainer.addEventListener("touchstart",h5Ges.touchStartListener, false);
    h5Ges.mContainer.addEventListener("touchmove",h5Ges.touchMoveListenner, false);
    h5Ges.mContainer.addEventListener("touchend",h5Ges.touchEndListener, false);
}
var touchStartHandler = function(h5Ges){
    return function (e) {
        let touche = e.touches[0];
        isTouchSpot({X: touche.pageX, Y: touche.pageY}, h5Ges.hasTouchedSpots, h5Ges.touchSpots, h5Ges.R);
    };
}

var touchMoveHandler = function(h5Ges){
    return function (e) {
        e.preventDefault();
        var touche = e.touches[0];
        var istouch = isTouchSpot({X: touche.pageX, Y: touche.pageY}, h5Ges.hasTouchedSpots, h5Ges.touchSpots, h5Ges.R);
        pickSpotsOnLine(h5Ges.hasTouchedSpots,h5Ges.dy);
        h5Ges.clear();
        let lastPoint = istouch ? null : {X: touche.pageX, Y: touche.pageY};
        drawNormal(h5Ges, h5Ges.hasTouchedSpots, lastPoint);
    };
}
var touchEndHandler = function(h5Ges){
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
}

function unbindEvent(h5Ges){
    var mContainer = h5Ges.mContainer;
    mContainer.removeEventListener("touchstart",h5Ges.touchStartListener, false);
    mContainer.removeEventListener("touchmove",h5Ges.touchMoveListenner, false);
    mContainer.removeEventListener("touchend",h5Ges.touchEndListener, false);
}
/**
 * 判断是否触摸到某个点以及是否已经被触摸过
 */
function isTouchSpot(currentSpot, touchedSpots, allSpots, R) {
    return allSpots.some(function (spot, index) {
        let xDiff = spot.X - currentSpot.X;
        let yDiff = spot.Y - currentSpot.Y;
        var dir = Math.pow((xDiff * xDiff + yDiff * yDiff), 0.5);
        if (dir < R & touchedSpots.indexOf(index) < 0) {
            touchedSpots.push(index);
            return true;
        }
    });
}
/**
 * 检查任意相邻两点直接是否有其他点，如果有者插入他们中间
 * @param touchedSpots
 * @param d
 */
function pickSpotsOnLine(touchedSpots,d){
    //var result = touchedSpots.slice(0);

    for(let i = 0 ;i < touchedSpots.length - 1;i++){

       var nums = numberOntheLineOf(touchedSpots[i],touchedSpots[i+1],d)
        var last = i+1;
       for(let k = 0;k <nums.length;k++){
           if(touchedSpots.indexOf(nums[k])==-1){
               console.log("has")
              touchedSpots.splice(last,0,nums[k]);
               last+=1;
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
    var ix = i % d, iy = parseInt(i / d);
    var jx = j % d, jy = parseInt(j / d);


    var dx = jx - ix, dy = jy - iy;

    if (dx != dy && dx != 0 && dy != 0) return result;

    //console.log("dx : dy = " + dx + " : " + dy);
    if (dx == dy) {
        var begin = d + 1 + i;
        while (begin < j) {
            result.push(begin);
            console.log(begin);
            begin += (d + 1);
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
