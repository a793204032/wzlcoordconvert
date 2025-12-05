const x_PI = Math.PI * 3000.0 / 180.0;
const PI = Math.PI;
const a = 6378245.0;
const ee = 0.00669342162296594323;

function outOfChina(lng, lat) {
    return (lng < 72.004 || lng > 137.8347) || (lat < 0.8293 || lat > 55.8271);
}

function transformLat(x, y) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * PI) + 40.0 * Math.sin(y / 3.0 * PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * PI) + 320 * Math.sin(y * PI / 30.0)) * 2.0 / 3.0;
    return ret;
}

function transformLng(x, y) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * PI) + 40.0 * Math.sin(x / 3.0 * PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * PI) + 300.0 * Math.sin(x / 30.0 * PI)) * 2.0 / 3.0;
    return ret;
}

// WGS84 -> GCJ-02
function wgs84ToGcj02(lng, lat) {
    if (outOfChina(lng, lat)) return [lng, lat];
    let dLat = transformLat(lng - 105.0, lat - 35.0);
    let dLng = transformLng(lng - 105.0, lat - 35.0);
    const radLat = lat / 180.0 * PI;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * PI);
    dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * PI);
    const mgLat = lat + dLat;
    const mgLng = lng + dLng;
    return [mgLng, mgLat];
}

// GCJ-02 -> WGS84 (近似，返回值为纠偏后的WGS84)
function gcj02ToWgs84(lng, lat) {
    if (outOfChina(lng, lat)) return [lng, lat];
    // 迭代求解更高精度
    let lngTemp = lng, latTemp = lat;
    for (let i = 0; i < 2; i++) {
        const [tmpLng, tmpLat] = wgs84ToGcj02(lngTemp, latTemp);
        const dLng = lng - tmpLng;
        const dLat = lat - tmpLat;
        lngTemp += dLng;
        latTemp += dLat;
    }
    return [lngTemp, latTemp];
}

// GCJ-02 <-> BD-09
function gcj02ToBd09(lng, lat) {
    const z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
    const theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
    const bdLng = z * Math.cos(theta) + 0.0065;
    const bdLat = z * Math.sin(theta) + 0.006;
    return [bdLng, bdLat];
}

function bd09ToGcj02(bdLng, bdLat) {
    const x = bdLng - 0.0065;
    const y = bdLat - 0.006;
    const z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_PI);
    const theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_PI);
    const ggLng = z * Math.cos(theta);
    const ggLat = z * Math.sin(theta);
    return [ggLng, ggLat];
}

// 复合转换
function wgs84ToBd09(lng, lat) {
    const gcj = wgs84ToGcj02(lng, lat);
    return gcj02ToBd09(gcj[0], gcj[1]);
}

function bd09ToWgs84(bdLng, bdLat) {
    const gcj = bd09ToGcj02(bdLng, bdLat);
    return gcj02ToWgs84(gcj[0], gcj[1]);
}

// 小工具：数组或对象输入的批量转换
function convertCoords(points, converter) {
     // 处理 convertCoords(lng, lat, converter)
    if (typeof points === 'number') {
        const lng = points;
        const lat = arguments[1];
        const conv = arguments[2];
        if (typeof lat === 'number' && typeof conv === 'function') {
            const res = conv(lng, lat);
            return Array.isArray(res) ? res : (res && typeof res === 'object' ? { lng: res.lng, lat: res.lat } : res);
        }
        throw new TypeError('调用格式不正确：expect convertCoords(lng, lat, converter)');
    }

    // 当传入单个数组点 [lng,lat]
    if (Array.isArray(points) && points.length === 2 && typeof points[0] === 'number' && typeof points[1] === 'number') {
        const res = converter(points[0], points[1]);
        return Array.isArray(res) ? res : (res && typeof res === 'object' ? { lng: res.lng, lat: res.lat } : res);
    }

    // 当传入单个对象点 {lng,lat}
    if (points && !Array.isArray(points) && typeof points === 'object' && typeof points.lng === 'number' && typeof points.lat === 'number') {
        const res = converter(points.lng, points.lat);
        if (Array.isArray(res)) return { lng: res[0], lat: res[1] };
        return res && typeof res === 'object' ? { lng: res.lng, lat: res.lat } : res;
    }

    // 批量：数组或对象数组
    if (!Array.isArray(points)) {
        throw new TypeError('points must be an array, object {lng,lat}, or numbers (lng,lat)');
    }

    return points.map(p => {
        if (Array.isArray(p)) {
            const [lng, lat] = converter(p[0], p[1]);
            return [lng, lat];
        } else {
            const { lng, lat } = p;
            const [nlng, nlat] = converter(lng, lat);
            return { lng: nlng, lat: nlat };
        }
    });
}

// 导出（Node/浏览器兼容）
convertCoords.wgs84ToGcj02 = wgs84ToGcj02;
convertCoords.gcj02ToWgs84 = gcj02ToWgs84;
convertCoords.gcj02ToBd09 = gcj02ToBd09;
convertCoords.bd09ToGcj02 = bd09ToGcj02;
convertCoords.wgs84ToBd09 = wgs84ToBd09;
convertCoords.bd09ToWgs84 = bd09ToWgs84;

export default convertCoords;