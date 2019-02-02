/*
 * person window
 */
Emin.BUSWindow = Ext.extend(Ext.app.Module, {
    id: 'BUS-win',
    init: function () {
        this.launcher = {
            text: '车辆管理',
            iconCls: 'icon-bus',
            handler: this.createWindow,
            scope: this
        }
    },
    createWindow: function () {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('BUS-win');
        if (!win) {
            var wg = new Ext.WindowGroup();
            wg.zseed = 7500;
            var pageSize = 20

            var statusStore = new Ext.data.JsonStore({
                data: [{k: "0", v: "未激活"}, {k: "1", v: "未使用"}, {k: "2", v: "已经使用"}, {k: "3", v: "异常"}, {
                    k: "4",
                    v: "维修中"
                }, {k: "-1", v: "报废"}],
                fields: ["k", "v"]
            })
            //请求载入数据
            var busStore = new Ext.data.JsonStore({
                url: basePath + "bus/pageStart",
                fields: ["id", "carNo", "status", "busTypeId"],
                root: "t.list",
                totalProperty: "t.allRow"
            })
            var busTypeStores = new Ext.data.JsonStore({
                url: basePath + "busType/all",
                fields: ["id", "brand", "version", "seatNum", "text"],
                root: "t",
                listeners:{
                	load: function() {
                		var p = new Ext.data.Record({'id':'','text':'全部'});
         				this.insert(0, p);
                	}
                }
            });
            var busTypeStore = new Ext.data.JsonStore({
                url: basePath + "busType/all",
                fields: ["id", "brand", "version", "seatNum", "text"],
                root: "t"
            });
            busTypeStores.load({
                callback: function () {
                    busStore.load({
                        params: {
                            start: 0,
                            limit: pageSize
                        }
                    })
                    busTypeStore.load();
                }
            })


            var busField = new Ext.form.FieldSet({
                defaults: {
                    anchor: "99%",
                    allowBlank: false
                },

                layout: "form",
                labelAlign: "right",
                labelWidth: 65,
                items: [{
                    xtype: "combo",
                    hiddenName: "busTypeId",
                    fieldLabel: "车辆类型",
                    blankText: "请选择车辆类型",
                    store: busTypeStore,
                    valueField: "id",
                    displayField: "text",
                    mode: "local",
                    editable: false,
                    triggerAction: "all",
                    listeners: {
                        beforeselect: function (c, r, i) {
                            //c.setRawValue(r.data.brand+r.data.version+"("+r.data.seatNum+"座)")
                            if(r.data.id != ''){
                           		r.set("text", r.data.brand + r.data.version + "(" + r.data.seatNum + "座)")
                           	}
                            r.commit()
                            return true;
                        }
                    },
                    tpl: '<tpl for="."><div x-combo-list-item class="x-combo-list-item">&nbsp;{brand}{version}({seatNum}座)</div></tpl>'
                }, {
                    xtype: "textfield",
                    name: "carNo",
                    fieldLabel: "车牌号",
                    blankText: "请填写车牌号",
                    regex: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/,
                    regexText: "车牌号格式错误"
                }]
            })
            var busForm = new Ext.FormPanel({
                layout: "fit",
                frame: true,
                items: [busField]
            })
            var busWin = new Ext.Window({
                manager: wg,
                layout: "fit",
                items: [busForm],
                closeAction: "hide",
                title: "添加车辆",
                constrainHeader: true,
                width: 300,
                height: 170,
                modal: true,
                listeners: {
                    hide: function () {
                        busForm.getForm().reset()
                    }
                },
                buttonAlign: "center",
                buttons: [{
                    text: "保存",
                    iconCls: "icon-save",
                    handler: function () {
                        if (busForm.getForm().isValid()) {
                            busForm.getForm().submit({
                                url: basePath + "bus/insert",
                                waitMsg: "正在保存车辆...",
                                waitTitle: "请稍候",
                                success: function (form, action) {
                                    busWin.hide()
                                    busStore.load({
                                        params: {
                                            start: 0,
                                            limit: pageSize
                                        }
                                    })
                                },
                                failure: function (form, action) {
                                    messageWindow({
                                        message: action.result ? "保存失败" : action.result.errorMsg
                                    })
                                }
                            })
                        }
                    }
                }]
            })
            var qrWindow = new Ext.Window({
                bodyStyle: "",
                html: "<img id='qrcodePreview' src='' style='width:100%;height:100%'/>",
                layout: "fit",
                modal: true,
                resizable: false,
                manager: wg,
                constrainHeader: true,
                width: 300,
                closeAction: "hide",
                height: 300,
                buttonAlign: "center",
                buttons: [{
                    text: '下载',
                    iconCls: 'icon-download',
                    handler: function () {
                        var url = document.getElementById("qrcodePreview").src
                        console.log(url)
                        exportReportWithNoParam(url)
                    }
                }]
            })
            //列模型
            var columnModel = new Ext.grid.ColumnModel([
                new Ext.grid.RowNumberer(),
                {
                    header: "车辆类型", dataIndex: "busTypeId", editor: {
                    xtype: "combo",
                    allowBlank: false,
                    store: busTypeStore,
                    valueField: "id",
                    displayField: "text",
                    mode: "local",
                    editable: false,
                    triggerAction: "all",
                    listeners: {
                        beforeselect: function (c, r, i) {
                            //c.setRawValue(r.data.brand+r.data.version+"("+r.data.seatNum+"座)")
                            console.log("R:"+r) 
                            console.log("c:"+c)
                            console.log("i:"+i)
                            r.set("text", r.data.brand + r.data.version + "(" + r.data.seatNum + "座)")
                            r.commit()
                            return true;
                        }
                    },
                    tpl: '<tpl for="."><div x-combo-list-item class="x-combo-list-item">&nbsp;{brand}{version}({seatNum}座)</div></tpl>'
                }, renderer: function (v, m, r) {
                    var busType = busTypeStores.query("id", v).itemAt(0)
                    return busType.data.brand + " " + busType.data.version + "(" + busType.data.seatNum + "座)"
                }
                },
                {header: "车牌号", dataIndex: 'carNo', editor: new Ext.form.TextField({
                    allowBlank: false,
                    regex: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-Z0-9]{4}[A-Z0-9挂学警港澳]{1}$/,
                    regexText: "车牌号格式错误"
                })},
                {
                    header: "状态", dataIndex: "status", editor: {
                    xtype: "combo",
                    allowBlank: false,
                    blankText: "请选择状态",
                    store: statusStore,
                    valueField: "k",
                    displayField: "v",
                    mode: "local",
                    editable: false,
                    triggerAction: "all"
                }, renderer: function (v, m, r) {
                    var statusRecord = statusStore.query("k", v).itemAt(0)
                    return statusRecord.data.v;
                }
                },
                {
                    header: "", dataIndex: "operations", xtype: "uxactioncolumn", items: [
                    {
                        text: '二维码',
                        iconCls: "icon-search",
                        tooltip: "查看车辆二维码",
                        handler: function (grid, rowIndex, columnIndex) {
                            var record = grid.getStore().getAt(rowIndex)
                            qrWindow.show(this.el)
                            document.getElementById("qrcodePreview").src = basePath + "bus/generationQRCode?id=" + record.data.id

                        }
                    }, {
                        text: "删除",
                        iconCls: "icon-remove",
                        tooltip: "删除车辆",
                        handler: function (grid, rowIndex, columnIndex) {
                            var record = grid.getStore().getAt(rowIndex)
                            Ext.Msg.confirm("提示", "是否删除此车辆？", function (btn) {
                                if (btn == "yes") {
                                    Ext.Msg.wait("正在删除车辆...", "请稍候")
                                    Ext.Ajax.request({
                                        url: basePath + "bus/delete",
                                        params: {
                                            id: record.data.id
                                        },
                                        success: function (response, request) {
                                            Ext.Msg.hide()
                                            var data = Ext.decode(response.responseText)
                                            if (data.success == false) {
                                                messageWindow({
                                                    message: data.errorMsg
                                                })
                                            }
                                            else {
                                                grid.getStore().reload()
                                            }
                                        },
                                        failure: function () {
                                            Ext.Msg.hide()
                                            messageWindow({
                                                message: "删除失败"
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    }
                ]
                }
            ])
			
            //search 面板
            var bysTypeTpl = new Ext.XTemplate(
				'<tpl for=".">',
				'<div x-combo-list-item class="x-combo-list-item">{[this.renderContent(values)]}</div>',
				'</tpl>',
				{
					renderContent:function(json){
						if(json.id==""){
							return "&nbsp;全部"
						}else{
							return "&nbsp;"+json.brand+json.version+"("+json.seatNum+"座)";
						}
					}
				}
			)
            var searchPanel = new Ext.form.FormPanel({
                region: "west",
                width: 280,
                bodyStyle: "padding-top:20px",
                layout: "form",
                collapsible: true,
                frame: true,
                defaults: {
                    anchor: "95%"
                },
                labelAlign: 'right',
                labelWidth: 65,
                items: [{
                    xtype: "combo",
                    hiddenName: "eq#busTypeId",
                    fieldLabel: "车辆类型",
                    store: busTypeStores,
                    valueField: "id",
                    value: '全部',
                    displayField: "text",
                    mode: "local",
                    editable: false,
                    triggerAction: "all",
                    listeners: {
                        beforeselect: function (c, r, i) {
                           	if(r.data.id != ''){
                           		r.set("text", r.data.brand + r.data.version + "(" + r.data.seatNum + "座)")
                           	}
                            r.commit()
                            return true;
                        }
                    },
                    /*tpl: '<tpl for="."><div x-combo-list-item class="x-combo-list-item">&nbsp;{brand}{version}({seatNum}座)</div></tpl>'*/
                   tpl:bysTypeTpl
                }, {
                    xtype: "textfield",
                    name: "like#carNo",
                    fieldLabel: "车牌号"
                }],
                buttonAlign: "center",
                buttons: [{
                    text: "查询",
                    iconCls: "icon-search",
                    handler: function () {
                        if (searchPanel.getForm().isValid()) {
                            var data = searchPanel.getForm().getValues(false);
                            if(data["eq#busTypeId"] == "全部"){
                            	data["eq#busTypeId"] = '';
                            }
                            busStore.baseParams = data
                            busStore.load({
                                params: {
                                    start: 0,
                                    limit: pageSize
                                }
                            })
                        }
                    }
                }, {
                    text: "重置",
                    iconCls: "icon-reset",
                    handler: function () {
                        searchPanel.getForm().reset();
                        busStore.baseParams = {};
                        busStore.load({
                            params: {
                                start: 0,
                                limit: pageSize
                            }
                        });
                    }
                }]
            })

            //可编辑面板
            var grid = new Ext.grid.EditorGridPanel({
                store: busStore,
                cm: columnModel,
                clicksToEdit: 2,
                enableHdMenu: false,
                tbar: [{
                    text: "添加",
                    iconCls: "icon-add",
                    handler: function () {
                        busWin.show(this.el)
                    }
                }],
                region: "center",
                sm: new Ext.grid.RowSelectionModel(),
                viewConfig: {
                    forceFit: true
                },
                listeners: {
                    afteredit: function (e) {
                        var record = e.record
                        if (record.isValid()) {
                            var data = record.data
                            Ext.Ajax.request({
                                url: basePath + "bus/update",
                                params: data,
                                success: function (response, request) {
                                    var data = Ext.decode(response.responseText)
                                    if (data.success) {
                                        record.commit()
                                    } else {
                                        record.reject()
                                        messageWindow({
                                            message: data.errorMsg
                                        })
                                    }
                                }, failure: function () {
                                    record.reject()
                                }
                            })
                        }
                    }
                },
                bbar: new Ext.PagingToolbar({
                    items: ["<div style='margin-left:20px;font-size:1.1em'><span style='font-weight:bolder;font-size:1.2em'>Tips</span>:双击进入编辑</div>"],
                    pageSize: pageSize,
                    store: busStore,
                    beforePageText: "第",
                    afterPageText: "页,共{0}页",
                    lastText: "尾页",
                    nextText: "下一页",
                    prevText: "上一页",
                    firstText: "首页",
                    refreshText: "刷新页面",
                    displayInfo: true,
                    displayMsg: '显示第{0}条到{1}条记录,一共{2}条',
                    emptyMsg: "没有记录"
                })
            })

            //窗口
            win = desktop.createWindow({
                id: 'BUS-win',
                listeners: {
                    close: function () {
                        qrWindow.close()
                        busWin.close()
                    }
                },
                title: '车辆管理',
                height: 500,
                items: [grid, searchPanel],
                iconCls: 'icon-bus',
                shim: false,
                animCollapse: false,
                constrainHeader: true,
                layout: 'border'
            });
        }
        win.show();
    }
});