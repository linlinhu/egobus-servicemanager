/*
 * person window
 */
Emin.PRODUCTMANAGEWindow = Ext.extend(Ext.app.Module, {
    id: 'PRODUCTMANAGE-win',
    init: function () {
        this.launcher = {
            text: '产品服务管理',
            iconCls: 'icon-PRODUCTMANAGE',
            handler: this.createWindow,
            scope: this
        }
    },
    createWindow: function () {
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('PRODUCTMANAGE-win');
        if (!win) {
            var wg = new Ext.WindowGroup(),
        		pageSize = 20;
            wg.zseed = 7500;
            
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
                'int@eq#starLevel': 5 
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
                                    searchPanel.getForm().setValues({PRODUCTMANAGE:'',starLevel:''})
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
                    header: '产品名称', 
                    dataIndex: 'starLevel',
                    renderer: function(v) {
                 		return v+"颗星";
                    }
                },
                {
                    header: '基础费用（元）', 
                    dataIndex: 'starLevel'
                },
                {
                    header: '基础时间（小时）', 
                    dataIndex: 'starLevel'
                },
                {header: '超时费用（元）', dataIndex: 'value', editor: new Ext.form.TextField({
                    allowBlank: false,
                    regex: /(^[0]$)|(^[1-9][0-9]{0,}$)|(^[0][.]{1}[0-9]{1,}$)/,
                    regexText: '请输入有效金额'
                })},
                {header: '超时时间（分钟）', dataIndex: 'value', editor: new Ext.form.TextField({
                    allowBlank: false,
                    regex: /(^[0]$)|(^[1-9][0-9]{0,}$)/,
                    regexText: '请输入非负整数'
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
                    store: statusStore,
                    valueField: 'levelId',
                    displayField: 'levelValue',
                    value:'5颗星',
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
                        levelValueStore.baseParams = {
			                'int@eq#starLevel': 5 
			            }
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
                id: 'PRODUCTMANAGE-win',
                listeners: {
                    close: function () {
                        levelWin.close()
                    }
                },
                title: '产品服务管理',
                height: 500,
                items: [grid, searchPanel],
                iconCls: 'icon-PRODUCTMANAGE',
                shim: false,
                animCollapse: false,
                constrainHeader: true,
                layout: 'border'
            });
        }
        win.show();
    }
});



//车辆服务管理历史版本
/*
 * person window
 */
Emin.BUSSERVICEWindow = Ext.extend(Ext.app.Module, {
    id:'BUSSERVICE-win',
    init : function(){
        this.launcher = {
            text: '车辆服务管理',
            iconCls:'icon-busService',
            handler : this.createWindow,
            scope: this
        }
    },
    createWindow : function(){
        var desktop = this.app.getDesktop();
        var win = desktop.getWindow('BUSSERVICE-win');
        if(!win){
            var pageSize = 20
            var wg = new Ext.WindowGroup();
            wg.zseed = 7500;
            //请求载入数据
            var busServiceStore = new Ext.data.JsonStore({
                url:basePath+"busService/query",               
                fields:["id","name","isActive","serviceFee","businessCode"],
                root:"t"               
            })
            var businessCodeStore = new Ext.data.JsonStore({
                url:basePath+"busService/queryBusinessCodes",
                root:"t",
                fields:["k","v"]
            })
            businessCodeStore.load({
            	callback:function(){
            		 busServiceStore.load()
            	}
            })
            
            //列模型
            var columnModel = new Ext.grid.ColumnModel([
                new Ext.grid.RowNumberer(),
                {header:"服务名称",dataIndex:"name",editor:new Ext.form.TextField({allowBlank:false})},
                {header:"是否激活",hidden:true , dataIndex:'isActive',xtype:"booleancolumn",trueText:"已激活",falseText:"未激活",editor:new Ext.form.Checkbox()},
                {header:"金额",dataIndex:"serviceFee",editor:new Ext.form.NumberField({minValue:0.01,allowDecimals:true,allowBlank:false}),renderer:function(v,metadata,record,rowIndex,columnIndex,store){
                    
                     return v+"元";
                }},
                {header:"服务类型",dataIndex:"businessCode",editor:new Ext.form.ComboBox({
                    store:businessCodeStore,
                    displayField:"v",
                    valueField:"k",
                    triggerAction:"all",
                    mode:"local",
                    editable:false
                }),renderer:function(v,m,r){
                     var busCode = businessCodeStore.query("k",v).itemAt(0);
                     
                     return busCode.data.v
                }}
                
            ])
            var busServiceField = new Ext.form.FieldSet({
                 defaults:{
                    anchor:"90%",
                    allowBlank:false
                 },
                
                 layout:"form",
                 labelAlign:"right",
                 labelWidth:65,
                 items:[{
                    xtype:"textfield",
                    name:"name",
                    fieldLabel:"服务名称",
                    blankText:"请填服务名称"
                 },{
                    xtype:"numberfield",
                    name:"serviceFee",
                    fieldLabel:"金额",
                    minValue:0.01,          
                    blankText:"请填写金额"
                 },{
                    xtype:"combo",
                    hiddenName:"businessCode",
                    fieldLabel:"服务类型",                   
                    blankText:"请选择服务类型",
                    store:businessCodeStore,
                    displayField:"v",
                    valueField:"k",
                    triggerAction:"all",
                    mode:"local",
                    editable:false
                 }]
            })
            var busServiceForm = new Ext.FormPanel({
                layout:"fit",
                frame:true,
                items:[busServiceField]
            })
            var busServiceWin = new Ext.Window({
                manager:wg,
                layout:"fit",
                items:[busServiceForm],
                closeAction:"hide",
                title:"添加车辆服务",
                constrainHeader:true,
                width:300,
                height:200,
                modal:true,
                listeners:{
                    hide:function(){
                        busServiceForm.getForm().reset()
                    }
                },
                buttonAlign:"center",
                buttons:[{
                    text:"保存",
                    iconCls:"icon-save",
                    handler:function(){
                        if(busServiceForm.getForm().isValid()){
                            busServiceForm.getForm().submit({
                                url:basePath+"busService/insert",
                                params:{
                                	isActive:true
                                },
                                waitMsg:"正在保存车辆服务...",
                                waitTitle:"请稍候",
                                success:function(form,action){
                                    busServiceWin.hide()
                                    busServiceStore.load()
                                },
                                failure:function(form,action){
                                	console.log(action.result)
                                    messageWindow({
                                        message:action.result?action.result.errorMsg:"保存失败"
                                    })
                                }
                            })
                        }
                    }
                }]
            })
            //search 面板
            var searchPanel = new Ext.form.FormPanel({
                region:"west",
                width:220,
                bodyStyle:"padding-top:20px",
                layout:"form",
                collapsible:true,
                frame:true,
                defaults:{
                    anchor:"90%"
                },
                labelAlign:'right',
                labelWidth:65,
                items:[{
                    xtype:"textfield",
                    name:"like#name",
                    fieldLabel:"服务名称"
                 },{
                    xtype:"combo",
                    hiddenName:"int@eq#businessCode",
                    fieldLabel:"服务类型",                
                    store:businessCodeStore,
                    displayField:"v",
                    valueField:"k",
                    triggerAction:"all",
                    mode:"local",
                    editable:false
                 },{
                    xtype:"combo",
                    hiddenName:"boolean@eq#isActive",
                    fieldLabel:"是否激活",                 
                    store:new Ext.data.JsonStore({
                    	data:[{k:"",v:"全部"},{k:"true",v:"是"},{k:"false",v:"否"}],
                    	fields:["k","v"]
                    }),
                    displayField:"v",
                    value:"",
                    valueField:"k",
                    triggerAction:"all",
                    mode:"local",
                    editable:false
                 }],
                 buttonAlign:"center",
                 buttons:[{
                    text:"查询",
                    iconCls:"icon-search",
                    handler:function(){
                        if(searchPanel.getForm().isValid()){
                        	
                            var data = searchPanel.getForm().getValues(false)
                            console.log(data)
                            busServiceStore.baseParams = data
                            busServiceStore.load()
                        }
                    }
                 },{
                    text:"重置",
                    iconCls:"icon-reset",
                    handler:function(){
                        searchPanel.getForm().reset();
                        busServiceStore.baseParams = {};
                        busServiceStore.load();
                    }
                 }]
            })
            
            //可编辑列表
            var grid = new Ext.grid.EditorGridPanel({
                store:busServiceStore,
                cm:columnModel,
                clicksToEdit:2,
                loadMask:true,
                enableHdMenu:false,
                tbar:[{
                    text:"添加",
                    iconCls:"icon-add",
                    handler:function(){
                        busServiceWin.show(this.el)
                    }
                }],
                region:"center",
                listeners:{
                    afteredit:function(e){
                        var record = e.record
                        if(record.isValid()){
                            var data = record.data
                            Ext.Ajax.request({
                                url:basePath+"busService/update",
                                params:data,
                                success:function(response,request){
                                    var data = Ext.decode(response.responseText)
                                    if(data.success){
                                        record.commit()
                                    }else{
                                        record.reject()
                                        messageWindow({
                                            message:data.errorMsg
                                        })
                                    }
                                },failure:function(){
                                    record.reject()
                                }
                            })
                        }
                    }
                },
                sm:new Ext.grid.RowSelectionModel(),
                viewConfig:{
                    forceFit:true,
                    emptyText:"没有数据"
                },
                bbar:["<div style='margin-left:20px;font-size:1.1em'><span style='font-weight:bolder;font-size:1.2em'>Tips</span>:双击进入编辑</div>"]
               
            })
            
            //窗口
            win = desktop.createWindow({
                    id: 'BUSSERVICE-win',
                    listeners:{
                        close:function(){
                            busServiceWin.close()
                        }
                    },
                    title:'车辆服务管理',
                    height:500,
                    items:[grid,searchPanel],
                    iconCls: 'icon-busService',
                    shim:false,
                    animCollapse:false,
                    constrainHeader:true,
                    layout: 'border'
                });
            }
            win.show();
    }
});