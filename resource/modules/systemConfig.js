/*
 * person window
 */
Emin.SYSTEMCONFIGSWindow = Ext.extend(Ext.app.Module, {
    id: 'SYSTEMCONFIGS-win',
    init: function () {
        this.launcher = {
            text: '系统配置',
            iconCls: 'icon-systemConfig',
            handler: this.createWindow,
            scope: this
        }
    },
    createWindow: function () {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('SYSTEMCONFIGS-win');
        if (!win) {
        	var wg = new Ext.WindowGroup(),
        		pageSize = 20;
            wg.zseed = 7500;
           
           var statusStore = new Ext.data.JsonStore({
               url: basePath + 'runtimeconfig/system/modules',
               fields: ['code', 'desc'],
               baseParams:{
               		time:new Date().getTime()
               },
               root: 't'
           })
           statusStore.load();
            //请求载入数据
            var operationConfigStore = new Ext.data.JsonStore({
                url: basePath + 'runtimeconfig/system/module',
                fields: ['name', 'key', 'defaultValue', 'value', 'type', 'desc', 'elementType', 'strings', 'validate'],
               	sortInfo : {      
			       field : 'name',      
			       direction : 'ASC'      
			    },
                root: 't'
            })
            operationConfigStore.baseParams = {
            	moduleCode: 1001,
                limit: pageSize
            }
           	operationConfigStore.load();
           
            var operationConfigField = new Ext.form.FieldSet({
                defaults: {
                    anchor: '95%',
                    allowBlank: false
                },

                layout: 'form',
                labelAlign: 'right',
                labelWidth: 65,
                items: [{
                    xtype: 'textarea',
                    name: 'name',
                    fieldLabel: '服务名称',
                    height:40,
                    readOnly: true
                }, {
                    xtype: 'textfield',
                    name: 'key',
                    fieldLabel: '标识',
                    readOnly: true
                },{
                    xtype: 'textfield',
                    name: 'value',
                    fieldLabel: '设置值',
                    allowBlank:true,
                    readOnly: true
                },{
                    xtype: 'textfield',
                    name: 'defaultValue',
                    fieldLabel: '默认值',
                    readOnly: true
                },{
                    xtype: 'textarea',
                    name: 'desc',
                    fieldLabel: '备注',
                    allowBlank:true,
                    readOnly: true
                }]
            })
            var operationConfigForm = new Ext.FormPanel({
                layout: 'fit',
                frame: true,
                items: [operationConfigField]
            })
            var operationConfigWin = new Ext.Window({
                manager: wg,
                layout: 'fit',
                items: [operationConfigForm],
                closeAction: 'hide',
                title: '配置详情',
                constrainHeader: true,
                width: 450,
                height: 280,
                modal: true,
                listeners: {
                    hide: function () {
                        operationConfigForm.getForm().reset()
                    }
                },
                buttonAlign: 'center'
            })
            
            //列模型
            var columnModel = new Ext.grid.ColumnModel([
                new Ext.grid.RowNumberer(),
                {
					header:'服务名称',
					dataIndex:'name'
				},
				{
					header:'标识',
					dataIndex:'key'
				},
				{
					header:'设置值',
					dataIndex:'value',
					editor:{
	        			xtype:'textfield',
	        			store : new Ext.data.SimpleStore({
	        				data:[],
	        				fields:['selectValue']
	        			}),
	        			triggerAction:'all',
	        			mode:'local',
	        			displayField:'selectValue',
	        			valueField:'selectValue',
	        			editable:false
        			}
				},
				{
					header:'默认值',
					dataIndex:'defaultValue',
				},
                {
                    header: '操作', dataIndex: 'operations', xtype: 'uxactioncolumn', items: [
                    {
                        text: '详情',
                        iconCls: 'icon-search',
                        tooltip: '查看配置详情',
                        className:'key',
                        handler: function (grid, rowIndex, columnIndex) {
                        	var record = grid.getStore().getAt(rowIndex);
                            operationConfigWin.show(this.el); 
                        	operationConfigForm.getForm().setValues(record.data);
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
                    hiddenName: 'operationConfigTypeId',
                    fieldLabel: '配置名称',
                    store: statusStore,
                    valueField: 'code',
                    value: '服务管理',
                    displayField: 'desc',
                    mode: 'local',
                    editable: false,
                    triggerAction: 'all'
                }],
                buttonAlign: 'center',
                buttons: [{
                    text: '查询',
                    iconCls: 'icon-search',
                    handler: function () {
                        if (searchPanel.getForm().isValid()) {
                            var data = searchPanel.getForm().getValues();
                            if(!(parseInt(data.operationConfigTypeId) == data.operationConfigTypeId)){
                            	data.operationConfigTypeId = 1001
                            };
                            operationConfigStore.baseParams = {
                            	moduleCode: data.operationConfigTypeId,
                    			limit: pageSize
                            }
                            operationConfigStore.load()
                        }
                    }
                }, {
                    text: '重置',
                    iconCls: 'icon-reset',
                    handler: function () {
                        searchPanel.getForm().reset();
                        operationConfigStore.baseParams = {};
                        operationConfigStore.load({
			           		params: {
			                    moduleCode: 1001,
			                    limit: pageSize
			                }
			           	});
                    }
                }]
            })
            //可编辑面板
            
            var grid = new Ext.grid.EditorGridPanel({
                store: operationConfigStore,
                cm: columnModel,
                clicksToEdit: 2,
                enableHdMenu: false,
                region: 'center',
                sm: new Ext.grid.RowSelectionModel(),
                viewConfig: {
                    forceFit: true
                },
                listeners: {
                	beforeedit:function(e){
                		if(e.record.data.elementType==null || e.record.data.elementType==''){
                			columnModel.setEditor(e.column,{xtype:'textfield'})
                		}else{
                			var d = []
	                		for(var i=0;i<e.record.data.strings.length;i++){
	                			d.push([e.record.data.strings[i]])
	                		}
                			columnModel.setEditor(e.column,{
			        			xtype:'combo',
			        			store : new Ext.data.SimpleStore({
			        				data:d,
			        				fields:['selectValue']
			        			}),
			        			triggerAction:'all',
			        			mode:'local',
			        			displayField:'selectValue',
			        			valueField:'selectValue',
			        			editable:false
		        			})
                			
                		}
                		
                	},
                    afteredit: function (e) {
                        var record = e.record
                        if (record.isValid()) {
                            var data = record.data,
                            	code = searchPanel.getForm().getValues();
                            if(!(parseInt(code.operationConfigTypeId) == code.operationConfigTypeId)){
                            	code.operationConfigTypeId = 1001
                            };
                            Ext.Ajax.request({
                                url: basePath + '/runtimeconfig/system/update',
                                params: {
                                	moduleCode: code.operationConfigTypeId,
                                	key: data.key,
                                	value: data.value
                                },
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
				bbar:['->',{
					iconCls: 'x-tbar-loading',
                    handler: function () {
                    	operationConfigStore.load();
                    }
				},
				{
			         xtype:'button',
			         text:'<div style="margin-left:20px;font-size:1.1em"><span style="font-weight:bolder;font-size:1.2em">Tips</span>:双击编辑设置值</div>'
			        
			    },'->']
           })
            // 窗口
            win = desktop.createWindow({
                id: 'SYSTEMCONFIGS-win',
                listeners: {
                    close: function () {
                        operationConfigWin.close()
                    }
                },
                title: '系统配置',
                height: 500,
                items: [grid, searchPanel],
                iconCls: 'icon-systemConfig',
                shim: false,
                animCollapse: false,
                constrainHeader: true,
                layout: 'border'
            });
        }
        win.show();
    }
});