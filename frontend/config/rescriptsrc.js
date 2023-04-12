module.exports = {
    devServer: (_ = {}) => {
        const config = _;
        config.headers = {
            'Access-Control-Allow-Origin': '*',
        };
        config.historyApiFallback = true;
        config.hot = true;
        config.liveReload = true;
        config.port = 8888;
        config.compress = false,
        config.proxy = {  //进行代理转发
            '/api': {
                target: `http://122.191.108.39`,
                changeOrigin: true,
                ws: false,
                pathRewrite: {'' : ''}
            }
        }
        return config;
    },
};
