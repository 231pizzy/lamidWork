"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _typeof = require("@babel/runtime/helpers/typeof");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = FieldSetBase;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _react = _interopRequireWildcard(require("react"));

var _componentHeader = _interopRequireDefault(require("../form-elements/component-header"));

var _componentLabel = _interopRequireDefault(require("../form-elements/component-label"));

var _dustbin = _interopRequireDefault(require("../multi-column/dustbin"));

var _ItemTypes = _interopRequireDefault(require("../ItemTypes"));

var _excluded = ["data", "class_name"];

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var accepts = [_ItemTypes["default"].BOX, _ItemTypes["default"].CARD];

function FieldSetBase(props) {
  var _useState = (0, _react.useState)({}),
      _useState2 = (0, _slicedToArray2["default"])(_useState, 2),
      childData = _useState2[0],
      setChildData = _useState2[1];

  var _useState3 = (0, _react.useState)(null),
      _useState4 = (0, _slicedToArray2["default"])(_useState3, 2),
      childItems = _useState4[0],
      setChildItems = _useState4[1];

  (0, _react.useEffect)(function () {
    var data = props.data,
        class_name = props.class_name,
        rest = (0, _objectWithoutProperties2["default"])(props, _excluded);
    setChildData(data);
    var count = 1;
    createChild(count, data);
  }, [props]);

  var addNewChild = function addNewChild() {
    var data = props.data;
    var colCount = data.childItems.length + 1;
    var oldChilds = data.childItems;
    data.childItems = Array.from({
      length: colCount
    }, function (v, i) {
      return oldChilds[i] ? oldChilds[i] : null;
    });
    setChildItems(data.childItems);
  };

  var _onDropSuccess = function onDropSuccess(droppedIndex) {
    var totalChild = childItems ? childItems.length : 0;
    var isLastChild = totalChild === droppedIndex + 1;

    if (isLastChild) {
      addNewChild();
    }
  };

  var createChild = function createChild(count, data) {
    var colCount = count;
    var className = data.class_name || "col-md-12";

    if (!data.childItems) {
      // eslint-disable-next-line no-param-reassign
      data.childItems = Array.from({
        length: colCount
      }, function (v, i) {
        return null;
      });
      data.isContainer = true;
    }

    setChildItems(data.childItems);
  };

  var controls = props.controls,
      editModeOn = props.editModeOn,
      getDataById = props.getDataById,
      setAsChild = props.setAsChild,
      removeChild = props.removeChild,
      seq = props.seq,
      className = props.className,
      index = props.index;
  var pageBreakBefore = childData.pageBreakBefore;
  var baseClasses = "SortableItem rfb-item";

  if (pageBreakBefore) {
    baseClasses += " alwaysbreak";
  }

  return /*#__PURE__*/_react["default"].createElement("div", {
    style: _objectSpread({}, props.style),
    className: baseClasses
  }, /*#__PURE__*/_react["default"].createElement(_componentHeader["default"], (0, _extends2["default"])({}, props, {
    isFieldSet: true
  })), /*#__PURE__*/_react["default"].createElement("div", null, /*#__PURE__*/_react["default"].createElement(_componentLabel["default"], props), /*#__PURE__*/_react["default"].createElement("div", {
    className: "row"
  }, childItems === null || childItems === void 0 ? void 0 : childItems.map(function (x, i) {
    return /*#__PURE__*/_react["default"].createElement("div", {
      key: "".concat(i, "_").concat(x || "_"),
      className: "col-md-12"
    }, controls ? controls[i] : /*#__PURE__*/_react["default"].createElement(_dustbin["default"], {
      style: {
        width: "100%"
      },
      data: childData,
      accepts: accepts,
      items: childItems,
      key: i,
      col: i,
      onDropSuccess: function onDropSuccess() {
        return _onDropSuccess(i);
      },
      parentIndex: index,
      editModeOn: editModeOn,
      _onDestroy: function _onDestroy() {
        return removeChild(childData, i);
      },
      getDataById: getDataById,
      setAsChild: setAsChild,
      seq: seq,
      rowNo: i
    }));
  }))));
}