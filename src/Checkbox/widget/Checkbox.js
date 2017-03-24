/*global logger*/
/*
    Checkbox
    ========================

    @file      : Checkbox.js
    @version   : 1.0.0
    @author    : Christopher James Hodges
    @date      : 2/1/2017
    @copyright : Mendix Technology Ltd
    @license   : Apache 2

    Documentation
    ========================
    Describe your widget here.
*/

// Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/dom-attr",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "Checkbox/lib/jquery-1.11.2",
    "dojo/text!Checkbox/widget/template/Checkbox.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, domStyle, domConstruct, dojoArray, lang, dojoAttr, dojoText, dojoHtml, dojoEvent, _jQuery, widgetTemplate) {
    "use strict";

    var $ = _jQuery.noConflict(true);

    // Declare widget's prototype.
    return declare("Checkbox.widget.Checkbox", [ _WidgetBase, _TemplatedMixin ], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM elements
        labelNode: null,
        checkboxNode: null,
        _contextObj: null,
        readOnly: false,
        _handles: null,
        _alertDiv: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            logger.debug(this.id + ".constructor");
            
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            logger.debug(this.id + ".postCreate");
            
            if (this.readOnly || this.get("disabled") || this.readonly) {
              this._readOnly = true;
            }
            
            this._updateRendering();
            this._setupEvents();
        },
        
        update: function (obj, callback) {
            logger.debug(this.id + '.update');
            
            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering(callback);
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function () {
          logger.debug(this.id + ".enable");
        },

        // mxui.widget._WidgetBase.enable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function () {
          logger.debug(this.id + ".disable");
        },

        // mxui.widget._WidgetBase.resize is called when the page's layout is recalculated. Implement to do sizing calculations. Prefer using CSS instead.
        resize: function (box) {
          logger.debug(this.id + ".resize");
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
          logger.debug(this.id + ".uninitialize");
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        // Attach events to HTML dom elements
        _setupEvents: function () {
            logger.debug(this.id + "._setupEvents");
        },
        
        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");
            
            if (this._contextObj !== null) {
                    if (this.readOnly || this._contextObj.isReadonlyAttr(this.attribute)) {
                    dojoAttr.set(this.labelNode, "disabled", "disabled");
                    dojoAttr.set(this.labelNode, "readonly", "readonly");
                }
                
                domStyle.set(this.domNode, 'display', 'block');
                if (this.applyClass !== ""){
                    dojo.addClass(this.domNode, this.applyClass);
                }
                
                dojoHtml.set(this.labelNode, this.label);
                
                var checkboxNode = null;
                
                var attributeValue = this._contextObj.get(this.attribute);

				checkboxNode = domConstruct.create("input", {
					"type": "checkbox",
					"value": this._contextObj.getGuid()
				});
                
                if (this.readOnly || this._contextObj.isReadonlyAttr(this.attribute)) {
                    dojoAttr.set(checkboxNode, "disabled", "disabled");
                    dojoAttr.set(checkboxNode, "readonly", "readonly");
                }
                
                if (attributeValue){
                    dojoClass.add(this.domNode, "checked");
                    dojoAttr.set(checkboxNode, "checked", true);
                }
                else{
                    dojoClass.remove(this.domNode, "checked");
                    dojoAttr.set(checkboxNode, "checked", false);
                }
                
                domConstruct.place(checkboxNode, this.labelNode);
                
                this._addOnFocus(checkboxNode);
                this._addOnBlur(checkboxNode);
                this._addOnClick(checkboxNode);
                
            } else {
                domStyle.set(this.domNode, 'display', 'none');
            }
            
            this._clearValidations();
            
            this._executeCallback(callback, "_updateRendering");
        },
        
         _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        },
        
        _addOnFocus: function (node) {
				logger.debug(this.id + "._addOnFocus");

				this.connect(node, "onfocus", lang.hitch(this, function () { 
                    dojoClass.add(this.domNode, "focused");
                    
				}));
			},
            
        _addOnBlur: function (node) {
            logger.debug(this.id + "._addOnFocus");

            this.connect(node, "onblur", lang.hitch(this, function () {
                dojoClass.remove(this.domNode, "focused");

            }));
        },

        _addOnClick: function (checkboxNode) {
            logger.debug(this.id + "._addOnclickToCheckboxItem");

            this.connect(checkboxNode, "onclick", lang.hitch(this, function () {
                
                var previousValue = this._contextObj.get(this.attribute);
                
                if (previousValue){
                    
                    dojoClass.remove(this.domNode, "checked");
                    dojoAttr.set(checkboxNode, "checked", false);
                    this._contextObj.set(this.attribute, "");
                }
                else {
                    
                    dojoClass.add(this.domNode, "checked");
                    dojoAttr.set(checkboxNode, "checked", true);
                    this._contextObj.set(this.attribute, "true");
                }

                if (this.onChangeMicroflow) {
                    this._triggerOnChange();
                }
            }));
        },
        
        _triggerOnChange: function () {
				this._execMF(this._contextObj, this.onChangeMicroflow);
			},
        
         // Handle validations.
        _handleValidation: function (validations) {
            logger.debug(this.id + "._handleValidation");
            this._clearValidations();

            var validation = validations[0],
                message = validation.getReasonByAttribute(this.attribute);

            if (this._readOnly) {
                validation.removeAttribute(this.attribute);
            } else if (message) {
                this._addValidation(message);
                validation.removeAttribute(this.attribute);
            }
        },

        // Clear validations.
        _clearValidations: function () {
            logger.debug(this.id + "._clearValidations");
            domConstruct.destroy(this._alertDiv);
            this._alertDiv = null;
        },

        // Show an error message.
        _showError: function (message) {
            logger.debug(this.id + "._showError");
            if (this._alertDiv !== null) {
                dojoHtml.set(this._alertDiv, message);
                return true;
            }
            this._alertDiv = domConstruct.create("div", {
                "class": "alert alert-danger",
                "innerHTML": message
            });
            domConstruct.place(this._alertDiv, this.domNode);
        },

        // Add a validation.
        _addValidation: function (message) {
            logger.debug(this.id + "._addValidation");
            this._showError(message);
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            this.unsubscribeAll();

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });

                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.attribute,
                    callback: lang.hitch(this, function (guid, attr, attrValue) {
                        this._updateRendering();
                    })
                });

                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    val: true,
                    callback: lang.hitch(this, this._handleValidation)
                });
            }
        },

        _execMF: function (obj, mf, callback) {
            logger.debug(this.id + "._execMF", mf);
            var params = {
                applyto: "selection",
                actionname: mf,
                guids: []
            };
            if (obj) {
                params.guids = [obj.getGuid()];
            }
            mx.data.action({
                params: params,
                callback: function (objs) {
                    if (typeof callback !== "undefined") {
                        callback(objs);
                    }
                },
                error: function (error) {
                    if (typeof callback !== "undefined") {
                        callback();
                    }
                    console.log(error.description);
                }
            }, this);
        }
    });
});

require(["Checkbox/widget/Checkbox"]);
