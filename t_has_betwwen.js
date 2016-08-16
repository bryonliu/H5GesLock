/**
 * Created by bryonliu on 2016/8/15.
 */
function isHaveBetwwen(i, j, d) {
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


    console.log("hah" + dx + "  " + dy);
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
