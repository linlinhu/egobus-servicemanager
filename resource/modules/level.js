/*
 * person window
 */
Emin.LEVELWindow = Ext.extend(Ext.app.Module, {
    id: 'LEVEL-win',
    init: function () {
        this.launcher = {
            text: '订单标签',
            iconCls: 'icon-level',
            handler: this.createWindow,
            scope: this
        }
    },
    createWindow: function () {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('LEVEL-win');
        if (!win) {
            var wg = new Ext.WindowGroup(),
        		pageSize = 20;
            wg.zseed = 7500;
            
			var statusStores = new Ext.data.JsonStore({
                data: [
                	{levelId: '', levelValue: '全部'},
                	{levelId: '5', levelValue: '5颗星'},
                	{levelId: '4', levelValue: '4颗星'},
                	{levelId: '3', levelValue: '3颗星'},
                	{levelId: '2', levelValue: '2颗星'},
                	{levelId: '1', levelValue: '1颗星'}
                ],
                fields: ['levelId', 'levelValue']
           	})
			var statusStore = new Ext.data.JsonStore({
                data: [
                	{levelId: '5', levelValue: '5颗星'},
                	{levelId: '4', levelValue: '4颗星'},
                	{levelId: '3', levelValue: '3颗星'},
                	{levelId: '2', levelValue: '2颗星'},
                	{levelId: '1', levelValue: '1颗星'}
                ],
                fields: ['levelId', 'levelValue']
           	})
            
            var levelValueStore = new Ext.data.JsonStore({
            	baseParams:{catalogid:0},
                url: basePath + 'order/ordertag/pageStart',
                fields: ['id', 'value', 'starLevel'],
                root: 't.list',
                totalProperty: 't.allRow'
            })
            levelValueStore.baseParams = {
                'int@eq#starLevel': ''
            }
            levelValueStore.load({
            	params: {
            		start: 0,
                	limit: pageSize
            	}
            })
          
            var levelField = new Ext.form.FieldSet({
                defaults: {
                    anchor: '90%',
                    allowBlank: false
                },

                layout: 'form',
                labelAlign: 'right',
                labelWidth: 65,
                items: [{
                    xtype: 'combo',
                    hiddenName: 'starLevel',
                    fieldLabel: '星级数',
                    store: statusStore,
                    valueField: 'levelId',
                    value:'5',
                    displayField: 'levelValue',
                    mode: 'local',
                    editable: false,
                    triggerAction: 'all'
                }, {
                    xtype: 'textfield',
                    name: 'value',
                    fieldLabel: '标签名',
                    blankText: '请输入中文标签',
                    regex: /^[\u4e00-\u9fa50-9a-zA-Z]{2,6}$/,
                    regexText: '标签格式错误',
                    listeners: {
				        render: function(obj) {
		                    var font=document.createElement('div');
		                    font.setAttribute("color","red");
		                    var tips=document.createTextNode('数字、中英文，2~6字符');//提示信息
		                    font.appendChild(tips);
		                    obj.el.dom.parentNode.appendChild(font);
				        }
				    }
                }]
            })
            var levelForm = new Ext.FormPanel({
                layout: 'fit',
                frame: true,
                items: [levelField]
            })
            var levelWin = new Ext.Window({
                manager: wg,
                layout: 'fit',
                items: [levelForm],
                closeAction: 'hide',
                title: '添加标签',
                constrainHeader: true,
                width: 300,
                height: 180,
                modal: true,
                listeners: {
                    hide: function () {
                        levelForm.getForm().reset()
                    }
                },
                buttonAlign: 'center',
                buttons: [{
                    text: '保存',
                    iconCls: 'icon-save',
                    handler: function () {
                        if (levelForm.getForm().isValid()) {
                            levelForm.getForm().submit({
                                url: basePath + 'order/ordertag/insert',
                                waitMsg: '正在保存标签...',
                                waitTitle: '请稍候',
                                success: function (form, action) {
                                    levelWin.hide();
                                    searchPanel.getForm().reset();
						            levelValueStore.baseParams = {}
                                    levelValueStore.load({
                                        params: {
                                        	start: 0,
						                	limit: pageSize
                                        }
                                    });
                                    
                                },
                                failure: function (form, action) {
                                    messageWindow({
                                        message: action.result ? '保存失败' : action.result.errorMsg
                                    })
                                }
                            })
                        }
                    }
                }]
            })
            //列模型
            var columnModel = new Ext.grid.ColumnModel([
                new Ext.grid.RowNumberer(),
                {
                    header: '星级数', 
                    dataIndex: 'starLevel',
                    renderer: function(v) {
                 		return v+"颗星";
                    }
                },
                {header: '标签', dataIndex: 'value', editor: new Ext.form.TextField({
                    allowBlank: false,
                    regex: /^[\u4e00-\u9fa50-9a-zA-Z]{2,6}$/,
                    regexText: '标签格式错误'
                })},
                {
                    header: '操作', dataIndex: 'operations', xtype: 'uxactioncolumn', items: [
                   {
                        text: '删除',
                        iconCls: 'icon-remove',
                        tooltip: '删除标签',
                        handler: function (grid, rowIndex, columnIndex) {
                            var record = grid.getStore().getAt(rowIndex)
                            Ext.Msg.confirm('提示', '是否删除此标签？', function (btn) {
                                if (btn == 'yes') {
                                    Ext.Msg.wait('正在删除标签...', '请稍候')
                                    Ext.Ajax.request({
                                        url: basePath + 'order/ordertag/delete',
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
                                                message: '删除失败'
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
            var searchPanel = new Ext.form.FormPanel({
                region: 'west',
                width: 220,
                bodyStyle: 'padding-top:20px',
                layout: 'form',
                collapsible: true,
                frame: true,
                defaults: {
                    anchor: '90%'
                },
                labelAlign: 'right',
                labelWidth: 65,
                items: [{
                    xtype: 'combo',
                    hiddenName: 'starLevel',
                    fieldLabel: '星级数',
                    store: statusStores,
                    valueField: 'levelId',
                    value:'',
                    displayField: 'levelValue',
                    mode: 'local',
                    editable: false,
                    triggerAction: 'all'
                }, {
                    xtype: 'textfield',
                    name: 'value',
                    fieldLabel: '标签'
                }],
                buttonAlign: 'center',
                buttons: [{
                    text: '查询',
                    iconCls: 'icon-search',
                    handler: function () {
                        if (searchPanel.getForm().isValid()) {
                            var data = searchPanel.getForm().getValues();
                            if(data.starLevel.length > 2){
                            	data.starLevel = data.starLevel[0];
                            }
                            levelValueStore.baseParams = {
                            	'string@like#value': data.value,
                                'int@eq#starLevel': data.starLevel 
                            }
                            levelValueStore.load({
                                params: {
                                	start: 0,
                                	limit: pageSize
                                }
                            })
                        }
                    }
                }, {
                    text: '重置',
                    iconCls: 'icon-reset',
                    handler: function () {
                        searchPanel.getForm().reset();
                        levelValueStore.baseParams = {}
			            levelValueStore.load({
			            	params: {
			            		start: 0,
			                	limit: pageSize
			            	}
			            })
                    }
                }]
            })

            //可编辑面板
            var grid = new Ext.grid.EditorGridPanel({
                store: levelValueStore,
                cm: columnModel,
                clicksToEdit: 2,
                enableHdMenu: false,
                tbar: [{
                    text: '添加',
                    iconCls: 'icon-add',
                    handler: function () {
                        levelWin.show(this.el)
                    }
                }],
                region: 'center',
                sm: new Ext.grid.RowSelectionModel(),
                viewConfig: {
                    forceFit: true
                },
                listeners: {
                    afteredit: function (e) {
                        var record = e.record
                        if (record.isValid()) {
                            var data = record.data
                            console.log(data)
                            Ext.Ajax.request({
                                url: basePath + 'order/ordertag/update',
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
                    items: ['<div style="margin-left:20px;font-size:1.1em"><span style="font-weight:bolder;font-size:1.2em">Tips</span>:双击进入编辑</div>'],
                    pageSize: pageSize,
                    store: levelValueStore,
                    beforePageText: '第',
                    afterPageText: '页,共{0}页',
                    lastText: '尾页',
                    nextText: '下一页',
                    prevText: '上一页',
                    firstText: '首页',
                    refreshText: '刷新页面',
                    displayInfo: true,
                    displayMsg: '显示第{0}条到{1}条记录,一共{2}条',
                    emptyMsg: '没有记录'
                })
            })

            //窗口
            win = desktop.createWindow({
                id: 'LEVEL-win',
                listeners: {
                    close: function () {
                        levelWin.close()
                    }
                },
                title: '订单标签',
                height: 500,
                items: [grid, searchPanel],
                iconCls: 'icon-level',
                shim: false,
                animCollapse: false,
                constrainHeader: true,
                layout: 'border'
            });
        }
        win.show();
    }
});