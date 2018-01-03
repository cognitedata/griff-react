'use strict';

exports.__esModule = true;
exports.default = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _lodash = require('lodash');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DataProvider = function (_Component) {
  _inherits(DataProvider, _Component);

  function DataProvider() {
    var _this2 = this;

    var _temp, _this, _ret;

    _classCallCheck(this, DataProvider);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, _Component.call.apply(_Component, [this].concat(args))), _this), _this.state = {
      subDomain: _this.props.config.baseSubdomain || _this.props.config.baseDomain,
      series: _this.props.config.series || {},
      contextSeries: {}
    }, _this.fetchData = function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee(reason) {
        var series, update;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _this.props.loader(_this.props.config.baseDomain, _this.state.subDomain, _this.props.config, _this.state.series, reason);

              case 2:
                series = _context.sent;
                update = {
                  series: series
                };

                if (reason !== 'UPDATE_SUBDOMAIN') {
                  update.contextSeries = series;
                }
                _this.setState(update);

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }(), _this.subDomainChanged = function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee3(subDomain) {
        var current;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                current = _this.state.subDomain;

                if (!(subDomain[0] === current[0] && subDomain[1] === current[1])) {
                  _context3.next = 3;
                  break;
                }

                return _context3.abrupt('return');

              case 3:
                clearTimeout(_this.subDomainChangedTimeout);
                _this.subDomainChangedTimeout = setTimeout(_asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                  return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return _this.fetchData('UPDATE_SUBDOMAIN');

                        case 2:
                        case 'end':
                          return _context2.stop();
                      }
                    }
                  }, _callee2, _this2);
                })), 100);
                _this.setState({ subDomain: subDomain });

              case 6:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, _this2);
      }));

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    }(), _temp), _possibleConstructorReturn(_this, _ret);
  }

  DataProvider.prototype.componentDidMount = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
      var _this3 = this;

      return _regenerator2.default.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return this.fetchData('MOUNTED');

            case 2:
              if (this.props.updateInterval) {
                this.fetchInterval = setInterval(function () {
                  _this3.fetchData('INTERVAL');
                }, this.props.updateInterval);
              }

            case 3:
            case 'end':
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function componentDidMount() {
      return _ref4.apply(this, arguments);
    }

    return componentDidMount;
  }();

  DataProvider.prototype.componentWillUnmount = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              clearInterval(this.fetchInterval);

            case 1:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, this);
    }));

    function componentWillUnmount() {
      return _ref5.apply(this, arguments);
    }

    return componentWillUnmount;
  }();

  DataProvider.prototype.shouldComponentUpdate = function shouldComponentUpdate(_ref6, _ref7) {
    var _this4 = this;

    var config = _ref6.config,
        loader = _ref6.loader,
        width = _ref6.width,
        height = _ref6.height;
    var nextSubdomain = _ref7.subDomain,
        series = _ref7.series;

    if (this.props.loader !== loader) {
      return true;
    }
    if (width !== this.props.width || height !== this.props.height) {
      return true;
    }
    var subDomain = this.state.subDomain;
    var domain = this.props.config.baseDomain;
    var nextDomain = config.baseDomain;

    if (domain[0] !== nextDomain[0] || domain[1] !== nextDomain[1] || subDomain[0] !== nextSubdomain[0] || subDomain[1] !== nextSubdomain[1]) {
      return true;
    }
    var currentSeries = this.state.series;

    var keys = Object.keys(series);
    var currentKeys = Object.keys(currentSeries);
    if (keys.length !== currentKeys.length) {
      return true;
    }
    var allKeys = (0, _lodash.uniq)([].concat(keys, currentKeys));

    var _loop = function _loop(i) {
      var key = allKeys[i];
      if (!currentSeries[key] || !series[key]) {
        return {
          v: true
        };
      }
      var oldSerie = currentSeries[key];
      var newSerie = series[key];
      if (oldSerie.data.length !== newSerie.data.length) {
        return {
          v: true
        };
      }
      var oldData = oldSerie.data;
      var newData = newSerie.data;
      var oldXAccessor = oldSerie.xAccessor || _this4.props.config.xAxis.accessor;
      var oldYAccessor = oldSerie.yAccessor || _this4.props.config.yAxis.accessor;
      var newXAccessor = newSerie.xAccessor || config.xAxis.accessor;
      var newYAccessor = newSerie.yAccessor || config.yAxis.accessor;
      oldData.some(function (oldPoint) {
        var newPoint = newData[i];
        if (oldXAccessor(oldPoint) !== newXAccessor(newPoint)) {
          return true;
        }
        if (oldYAccessor(oldPoint) !== newYAccessor(newPoint)) {
          return true;
        }
        return false;
      });
      return {
        v: false
      };
    };

    for (var i = 0; i < allKeys.length; i += 1) {
      var _ret2 = _loop(i);

      if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
    }
    return false;
  };

  DataProvider.prototype.componentDidUpdate = function componentDidUpdate(prevProps, prevState) {
    if (this.props.loader !== prevProps.loader) {
      return this.fetchData('NEW_LOADER');
    }
    var domain = this.props.config.baseDomain;
    var oldDomain = prevProps.baseDomain;

    if (domain && oldDomain && (domain[0] !== oldDomain[0] || domain[1] !== oldDomain[1])) {
      return this.fetchData('NEW_DOMAIN');
    }
    return 1;
  };

  DataProvider.prototype.componentWillUnmount = function componentWillUnmount() {
    clearInterval(this.fetchInterval);
  };

  DataProvider.prototype.render = function render() {
    var _this5 = this;

    var _props = this.props,
        width = _props.width,
        height = _props.height,
        margin = _props.margin;
    var _state = this.state,
        series = _state.series,
        contextSeries = _state.contextSeries;
    var config = this.props.config;

    if (!series) {
      return null;
    }
    var children = _react2.default.Children.map(this.props.children, function (child, i) {
      var props = {
        yAxis: config.yAxis,
        xAxis: config.xAxis,
        domain: config.baseDomain,
        subDomain: _this5.state.subDomain,
        series: _this5.state.series,
        contextSeries: contextSeries,
        width: width,
        height: height,
        margin: margin,
        subDomainChanged: _this5.subDomainChanged,
        key: i + 1
      };
      return _react2.default.cloneElement(child, props);
    });
    return children;
  };

  return DataProvider;
}(_react.Component);

exports.default = DataProvider;


DataProvider.propTypes = process.env.NODE_ENV !== "production" ? {
  config: _propTypes2.default.object.isRequired,
  width: _propTypes2.default.number.isRequired,
  height: _propTypes2.default.number.isRequired,
  margin: _propTypes2.default.object,
  updateInterval: _propTypes2.default.number
} : {};

DataProvider.defaultProps = {
  margin: {
    top: 20,
    left: 20,
    bottom: 0,
    right: 0
  }
};
module.exports = exports['default'];