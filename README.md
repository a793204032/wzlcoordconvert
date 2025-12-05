<!--
 * @Author: wang_zl2@hdec.com
 * @Date: 2025-12-05 10:11:39
 * @LastEditors: wang_zl2@hdec.com
 * @LastEditTime: 2025-12-05 11:01:01
 * @FilePath: \npmTest\README.md
 * @Description: Description
-->
# coord-convert

经纬度坐标转换库（WGS84 ⇄ GCJ-02 ⇄ BD-09），支持单点与批量输入，兼容 CommonJS 与 ESM。

## 特性
- 支持 WGS84、GCJ-02（高德/腾讯）、BD-09（百度）互转
- 支持单点（数组/对象/参数形式）与批量（数组/对象数组）
- CommonJS 默认导出为主转换函数，内置转换函数挂载在该函数上，便于直接使用
- 可在 Node 与浏览器中使用

## 安装
直接把仓库代码放入项目或通过 npm（如已发布）：
```bash
npm install wzlcoordconvert
```

## 使用示例

ESM（package.json `"type":"module"` 或 .mjs）
```javascript
import convert from 'wzlcoordconvert';

// 单点（传参形式）
const p1 = convert(116.397128, 39.916527, convert.wgs84ToGcj02);

// 单点（数组形式或对象形式）
const p2 = convert([116.397128, 39.916527], convert.wgs84ToGcj02);
const p3 = convert({ lng: 116.397128, lat: 39.916527 }, convert.wgs84ToGcj02);

// 批量
const arr = [[116.397128,39.916527],[121.473701,31.230416]];
const out = convert(arr, convert.wgs84ToBd09);
console.log(out);
```

CommonJS
```javascript
const convert = require('wzlcoordconvert');

// 使用方式相同（convert 是函数，内置转换函数为属性）
const out = convert([[116.397128,39.916527]], convert.wgs84ToGcj02);
console.log(out);
```

## API 概览
- convert(points, converter) / convert(lng, lat, converter)
  - points 支持：[[lng,lat], ...]、[{lng,lat}, ...]、[lng,lat]、{lng,lat}
  - converter 为 (lng, lat) => [lng2, lat2] 或返回对象 {lng, lat}
- 内置转换函数（都挂在 convert 上）：
  - convert.wgs84ToGcj02(lng, lat)
  - convert.gcj02ToWgs84(lng, lat)
  - convert.gcj02ToBd09(lng, lat)
  - convert.bd09ToGcj02(lng, lat)
  - convert.wgs84ToBd09(lng, lat)
  - convert.bd09ToWgs84(lng, lat)

注意：gcj02ToWgs84 为迭代近似纠偏，精度满足地图显示与常规定位需求。