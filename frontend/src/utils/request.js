//对axios进行二次封装,将刚才下载好的axios导入进来
import axios from "axios";
import { message } from "antd";

//1.利用axios对象的方法create,去创建一个axios实例
//2.requests就是axios,只不过稍微配置一下
const requests = axios.create({
    //配置对象
    //基础路径，发请求的时候，路径当中会出现api，不用你手写
    baseURL: '/',
    //请求时间超过5秒
    timeout: 1000 * 60
});
//请求拦截器:在发请求之前，请求拦截器可以检测到,可以在请求发出去之前做一些事情
requests.interceptors.request.use((config) => {
    //config是个配置对象，对象里面有一个属性很重要，headers请求头
    return config;
});

//响应拦截器：包含两个函数（一个是成功返回的函数，一个是失败的返回的函数）
requests.interceptors.response.use((res) => {
    //成功的回调函数：服务器响应数据回来以后，响应拦截器可以检测到，可以做一些事情。
    return res.data;
}, ( err ) => {
    const { status, data } = err.response;
    if ( status == 403 && data == 'RBAC: access denied') {
        message.info('权限不足，无法访问资源');
    }
    return promise.reject(new Error('faile'))
});
//对外暴露requests(axios的二次封装)
export default requests;
