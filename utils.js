"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var immutable_1 = require("immutable");
var Utils = (function () {
    function Utils() {
    }
    Utils.createElement = function (tagName) {
        return function (props) {
            return Utils.createReactElement(tagName, props);
        };
    };
    Utils.createReactElement = function (tagName, props) {
        var data = props.mark ? props.mark.data : props.node.data;
        var intentions = data.get("intentions");
        var categories = data.get("categories");
        if (!intentions && !categories) {
            return React.createElement(tagName, props.attributes, props.children);
        }
        if (!intentions) {
            intentions = immutable_1.List(Object.keys(categories).map(function (k) { return categories[k]; }));
        }
        else if (categories) {
            intentions = immutable_1.List(immutable_1.Set(intentions).union(Object.keys(categories).map(function (k) { return categories[k]; })));
        }
        else {
            intentions = immutable_1.List(intentions);
        }
        var className = intentions
            .update(function (collection) {
            return collection.reduce(function (cn, fn) { return cn + " " + Utils.Configuration.IntentionsMap[fn](); }, "");
        })
            .trim();
        var attr = props.attributes || {};
        Object.assign(attr, { className: className });
        return props.children ? React.createElement(tagName, attr, props.children) : React.createElement(tagName, attr);
    };
    Utils.createLinkElement = function () {
        return function (props) {
            var data = props.node.data;
            var href = data.get('href');
            var target = data.get('target');
            Object.assign(props.attributes, { href: href, target: target });
            return Utils.createReactElement("a", props);
        };
    };
    return Utils;
}());
Utils.Configuration = {
    IntentionsMap: {},
    Schema: {
        nodes: {
            'block-quote': Utils.createElement('blockquote'),
            'bulleted-list': Utils.createElement('ul'),
            'heading-one': Utils.createElement('h1'),
            'heading-two': Utils.createElement('h2'),
            'heading-three': Utils.createElement('h3'),
            'heading-four': Utils.createElement('h4'),
            'heading-five': Utils.createElement('h5'),
            'heading-six': Utils.createElement('h6'),
            'list-item': Utils.createElement('li'),
            'numbered-list': Utils.createElement('ol'),
            'link': Utils.createLinkElement(),
            'code': Utils.createElement('pre'),
            'paragraph': Utils.createElement("p"),
            'custom': Utils.createElement("div")
        },
        marks: {
            bold: Utils.createElement('b'),
            italic: Utils.createElement('i'),
            underlined: Utils.createElement('u'),
            custom: Utils.createElement('span')
        }
    }
};
exports.Utils = Utils;
