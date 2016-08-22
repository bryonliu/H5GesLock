# H5GesLock
##html5页面手势密码锁
 * option={
 *     width : 宽度，建议使用默认的屏幕宽度
 *     height : 高度
 *     R      : 大圆的半径
 *     R_INNER: 选中之后内圆的半径
 *     dy     : 维度（N*N），默认是3
 *     offsetX: 左右留白
 *     offsetY:上下留白
 *     lineWidthNormal : 绘制大圆的线宽
 *     lineWidthTouched：绘制触摸点连接线的线宽
 *
 *     colorNormal ： 正常情况下绘制大圆的边框颜色
 *     colorNormalTouched：选中情况下绘制连接线的颜色
 *     colorNormalTouchedFill ：选中情况下绘制大圆的填充色
 *     colorWarnTouched ：警告情况下连接线的颜色
 *     colorWarnTouchedFill： 警告情况下选中点的大圆填充色
 *
 *     inputEnd： 输入一次之后的回调函数参数｛pwd｝
 * }

##H5GesLock 对外方法：

 *     init(delay):初始化 #delay#{int}延迟多久进行初始化，主要处理用于展示显示警告或者绘制之后的样式

 *     drawWarn ： 绘制上次的告警样式

##Demo:
```
    var hgesLock = new H5GesLock({
        container: "canvas",
        inputEnd:function(str){
            console.log("pwd: " + str);
            hgesLock.drawWarn();
            hgesLock.init(1000)
        }
    });
    hgesLock.init();
```
