/*
 * person window
 */
Emin.ONLINEWindow = Ext.extend(Ext.app.Module, {
    id: 'ONLINE-win',
    init: function () {
        this.launcher = {
            text: '上线状态视图',
            iconCls: 'icon-online',
            handler: this.createWindow,
            scope: this
        }
    },
    createWindow: function () {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('ONLINE-win');
        if (!win) {
            var wg = new Ext.WindowGroup(),
        		pageSize = 20,
        		isValidate = true;
            wg.zseed = 7500;
            
			var statusStore = new Ext.data.JsonStore({
            	url: basePath +'driver/getStatus',
            	fields: ['key', 'msg'],
            	baseParams:{
               		time:new Date().getTime()
               	},
            	root: 't',
            	listeners:{
                	load: function() {
                		var p = new Ext.data.Record({'key':'','msg':'全部'});
         				this.insert(0, p);
                	}
                }
           	})
            
            var driverBusRelativeStore = new Ext.data.JsonStore({
                url: basePath + 'driverBusRelative/pageStart',
                fields: ['busId', 'driverId', 'driverName', 'phoneNumber', 'idCard', 'status', 'createTime', 'carNo'],
                baseParams:{
               		'boolean@eq#isValidate': isValidate
               },
                root: 't.list',
                totalProperty: 't.allRow'
            })
            statusStore.load();
            driverBusRelativeStore.load({
            	params: {
            		start: 0,
                	limit: pageSize
            	}
            })
            
            //列模型
            var columnModel = new Ext.grid.ColumnModel([
                new Ext.grid.RowNumberer(),
                {
                    header: '车牌号', 
                    width:75,
                    dataIndex: 'carNo'
                },
                {
                	header: '司机姓名',
                	width:75,
                    dataIndex: 'driverName'
                },
                {
                	header: '手机号',
                	width:75,
                    dataIndex: 'phoneNumber'
                },
                {
                	header: '状态', 
                    dataIndex: 'status',
                    width:75,
                    renderer: function(v) {
                    	var data = statusStore.reader.jsonData.t,
                    		dataLen = data.length,
                    		i;
                    	for (i = 0; i < dataLen; i++) {
                    		if (data[i].key == v) {
                    			return data[i].msg;
                    		}
                    	}
                    }
                },
                {
                	header: '上线时间', 
                    dataIndex: 'createTime',
                    renderer: function(v) {
                    	return new Date(v).format("Y-m-d H:i:s");
                    }
                }
            ])

            //search 面板
            var searchPanel = new Ext.form.FormPanel({
                region: 'west',
                width: 270,
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
                    hiddenName: 'int@eq#status',
                    fieldLabel: '上线状态',
                    store: statusStore,
                    valueField: 'key',
                   	value:'全部',
                    displayField: 'msg',
                    mode: 'local',
                    editable: false,
                    triggerAction: 'all'
                }, {
                	xtype: 'textfield',
                	cls:"Wdate",
                    name: 'date@gt#createTime',
                    fieldLabel: '上线时间',
                    listeners:{  
	                    focus:function(){
	                    	WdatePicker({el:this.el.dom,dateFmt:"yyyy-MM-dd HH:mm:ss",maxDate:'%yyyy-%MM-%dd %HH:%mm:%ss',errDealMode:2})
	                    }
	                }
                },{
                    xtype: 'textfield',
                    name: 'like#bus.carNo',
                    fieldLabel: '车牌号'
                }, {
                	xtype: 'textfield',
                    name: 'like#driverName',
                    fieldLabel: '司机姓名'
                }, {
                	xtype: 'textfield',
                    name: 'like#phoneNumber',
                    fieldLabel: '手机号'
                }],
                buttonAlign: 'center',
                buttons: [{
                    text: '查询',
                    iconCls: 'icon-search',
                    handler: function () {
                        if (searchPanel.getForm().isValid()) {
                            var data = searchPanel.getForm().getValues();
                            data["boolean@eq#isValidate"] = isValidate;
                            if(data["int@eq#status"] == "全部"){
                            	data["int@eq#status"] = '';
                            }
                            driverBusRelativeStore.baseParams = data;
                            driverBusRelativeStore.load({
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
                        driverBusRelativeStore.baseParams = {
                        	'boolean@eq#isValidate': isValidate
                        };
                        driverBusRelativeStore.load({
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
                store: driverBusRelativeStore,
                cm: columnModel,
                clicksToEdit: 2,
                enableHdMenu: false,
                region: 'center',
                sm: new Ext.grid.RowSelectionModel(),
                viewConfig: {
                    forceFit: true
                },
                bbar: new Ext.PagingToolbar({
                    pageSize: pageSize,
                    store: driverBusRelativeStore,
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
                id: 'ONLINE-win',
                title: '上线状态视图',
                height: 500,
                items: [grid, searchPanel],
                iconCls: 'icon-online',
                shim: false,
                animCollapse: false,
                constrainHeader: true,
                layout: 'border'
            });
        }
        win.show();
    }
});