// Multiple side-effect patterns in one module

// Enum IIFE
var Color;
(function (Color) {
  Color['Red'] = 'Red';
  Color['Blue'] = 'Blue';
})(Color || (Color = {}));

// Prototype mutation
String.prototype.toColor = function () {
  return Color[this];
};

export { Color };
