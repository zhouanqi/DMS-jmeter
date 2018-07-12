# DMS-jmeter
### 基于 JMeter 的汽车后市场的云平台压测脚本
主要压测模块为采购管理、销售管理、结算管理，覆盖14个流程。

采用的方法是把每一个功能点独立线程，建立断言，数据通过参数传递，权限使用token信息：

```
// 登录线程组传递token参数
String loginname=bsh.args[0];
String logintoken=bsh.args[1];

props.put("loginname",bsh.args[0]);
props.put("logintoken",bsh.args[1]);


//其余线程组获取token参数：
String logintoken = props.get("logintoken");
String loginname = props.get("loginname");
//log.info("get token:---------------------------------------:");
//log.info(logintoken);
vars.put("logintoken",logintoken);
vars.put("loginname",loginname);
//log.info("get name:---------------------------------------:");
//log.info(loginname);
```