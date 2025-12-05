/**
 * 坐标点 - 数组格式 [经度, 纬度]
 */
export type CoordArray = [number, number];

/**
 * 坐标点 - 对象格式
 */
export interface CoordObject {
  lng: number;
  lat: number;
}

/**
 * 坐标转换器函数类型
 */
export type CoordConverter = (lng: number, lat: number) => CoordArray;

/**
 * 坐标转换主函数
 * 
 * @example
 * // 分离参数调用
 * convertCoords(116.404, 39.915, convertCoords.wgs84ToGcj02);
 * 
 * @example
 * // 数组单点
 * convertCoords([116.404, 39.915], convertCoords.wgs84ToGcj02);
 * 
 * @example
 * // 对象单点
 * convertCoords({ lng: 116.404, lat: 39.915 }, convertCoords.wgs84ToGcj02);
 * 
 * @example
 * // 批量数组
 * convertCoords([[116.404, 39.915], [121.473, 31.230]], convertCoords.wgs84ToGcj02);
 * 
 * @example
 * // 批量对象
 * convertCoords([{ lng: 116.404, lat: 39.915 }], convertCoords.wgs84ToGcj02);
 */
declare function convertCoords(lng: number, lat: number, converter: CoordConverter): CoordArray;
declare function convertCoords(point: CoordArray, converter: CoordConverter): CoordArray;
declare function convertCoords(point: CoordObject, converter: CoordConverter): CoordObject;
declare function convertCoords(points: CoordArray[], converter: CoordConverter): CoordArray[];
declare function convertCoords(points: CoordObject[], converter: CoordConverter): CoordObject[];

declare namespace convertCoords {
  /**
   * WGS84 转 GCJ-02（国测局坐标，高德/腾讯地图）
   */
  export function wgs84ToGcj02(lng: number, lat: number): CoordArray;
  
  /**
   * GCJ-02 转 WGS84（GPS坐标）
   */
  export function gcj02ToWgs84(lng: number, lat: number): CoordArray;
  
  /**
   * GCJ-02 转 BD-09（百度坐标）
   */
  export function gcj02ToBd09(lng: number, lat: number): CoordArray;
  
  /**
   * BD-09 转 GCJ-02
   */
  export function bd09ToGcj02(bdLng: number, bdLat: number): CoordArray;
  
  /**
   * WGS84 转 BD-09
   */
  export function wgs84ToBd09(lng: number, lat: number): CoordArray;
  
  /**
   * BD-09 转 WGS84
   */
  export function bd09ToWgs84(bdLng: number, bdLat: number): CoordArray;
}

export default convertCoords;
export { convertCoords };