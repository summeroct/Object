;(function(win, app) {
    var $ = win['Zepto'];
    var timer,
        pagenum = 1,
        conSize = 3;

    var redList = $('#redList'),
        couponList = $('#couponList'),
        nondata = $('#nondata'),
        nondataText = $('#nondataText'),
        divMore = $('#moreCoupon'),
        btnMore = divMore.find('.btn-more');

    var msgMap = {
        "error_getRedpack": "获取红包失败，请稍后再试！",
        "error_getCoupon": "获取优惠券失败，请稍后再试！",
        "error_nomore": "没有更多了！",
        "error_server": "服务器开小差了，请稍后再试！",
        "error_MAX_LIMITED": "查红包的人太多了，您可以去支付宝查看~"
    }

    app.bindMore = function() {
        var btnToTop = $('#toTop');

        /*setTimeout(function(){
            divMore.show();
        }, 100);*/

        /*$('#moreRedpack').on('click', function(e){
            //
            e.preventDefault();
            app.getRedpack( pagenum );
        });*/

        btnMore.on('click', function(e){
            //
            e.preventDefault();
            app.getCoupon();
        });

        btnToTop.on('click', function(e){
            e.preventDefault();
            //document.body.scrollTop = 0;
            scrollTo(0, 100);
        });

        $(win).on('scroll', function(){

            clearTimeout( timer );
            timer = setTimeout(function(){
                if ( document.body.scrollTop > 200 ) {
                    //
                    btnToTop.show().animate({
                        opacity: 1
                    }, 200, 'ease-in', function(){
                        $(this).show();
                    });
                } else {

                    btnToTop.animate({
                        opacity: 0
                    }, 200, 'ease-in', function(){
                        $(this).hide();
                    });
                }
            }, 200);
        });

        function scrollTo( to, time ) {
            var from = parseInt( document.body.scrollTop ),
                runEvery = 20,//ms
                i = 0;
            to = parseInt( to );
            time /= runEvery;

            var interval = setInterval(function(){
                i++;

                document.body.scrollTop = from + ( to - from ) / time * i;
                if ( i >= time) {
                    clearInterval( interval );
                }
            }, runEvery);
        }
    };

    app.showMsg = function( msg ){
        //
        console.log( msg );
        //lib.notification.simple(msg);

        if ( !!msg && msg !== '' ) {
            nondataText.html( msg );
        }
        nondata.show();
    };
    app.msgNoRedpack = function() {
        $('#noRedPack').show();
    };

    /*
    app.getRedpack = function( pnum ) {
        lib.mtop.request(
            {
                api: 'mtop.msp.coupon.getMyLuckyMoney',
                v: '1.0',
                data: {
                    'page': pagenum,
                    'size': conSize
                }
            },
            function ( dd ) {
                //OK 显示
                console.log('get more: '+ pagenum);

                var ret = dd.ret[0],
                    data = dd.data,
                    items = data.result;

                if ( ret ) {
                    var type = ret.split('::')[0];
                    if ( type === 'SUCCESS' ) {
                        //
                        console.log(data);

                        //没有数据
                        if ( items.length < 1 ) {                            
                            app.showMsg('没有更多了！');

                            //隐藏更多按钮
                            divMore.hide();
                            return;
                        }

                        //
                        app.showRedpack( items );
                        //成功回调 页码增加 pnum += 1;
                        pagenum += 1;

                    } else {
                        //
                        app.showMsg('获取红包失败，请稍后再试！');
                    }
                }
            },
            function (result) {
                //error
                console.log('get more error');
                app.showMsg('服务器出差了，请稍后再试！');
            }
        );
    };
    */

    app.getCoupon = function() {
        //
        lib.mtop.request(
            {
                api: 'mtop.msp.coupon.getMyCouponList',
                v: '1.0',
                data: {
                    'page': pagenum,
                    'size': conSize
                }
            },
            function ( dd ) {
                //OK 显示
                console.log('get more: '+ pagenum);

                var ret = dd.ret[0],
                    data = dd.data;

                if ( ret ) {
                    var type = ret.split('::')[0];
                    if ( type === 'SUCCESS' ) {
                        //
                        console.log(data);

                        //没有更多数据
                        if ( !data.list ) {
                            lib.notification.simple( msgMap['error_nomore'] );

                            setTimeout(function(){
                                //隐藏更多按钮
                                divMore.hide();
                            }, 3000);

                            //禁用更多按钮
                            //btnMore.attr('disabled', 'disabled').addClass('disabled')
                            return;
                        }

                        //
                        app.showCoupon( data.list, data.totalNums );
                        //成功回调 页码增加 pnum += 1;
                        pagenum += 1;

                    } else {
                        //app.showMsg( msgMap['error_getCoupon'] );
                        lib.notification.simple( msgMap['error_getCoupon'] );
                    }
                }
            },
            function (result) {
                //error
                //console.log('get more error');
                //app.showMsg( msgMap['error_sever'] );
                lib.notification.simple( msgMap['error_server'] );

            }
        );
    };

    app.showRedpack = function( data ) {
        //
        var i = 0,
            key,
            money,
            startTime = '',
            endTime = '',
            tempHTML = '',
            dataLen = data.length;

        if ( dataLen < 1 ) {
            //没有数据
            //redList.html('您还没有领过红包，去其它地方逛逛吧！');
            return;
        }

        for ( ; i < dataLen; i++ ) {
            key = data[i];

            money = parseInt(key.currentAmount);//金额`取整
            startTime = key.gmtActive.substr(0,4) +'.'+ key.gmtActive.substr(4,2) +'.'+ key.gmtActive.substr(6,2);
            endTime = key.gmtExpired.substr(0,4) +'.'+ key.gmtExpired.substr(4,2) +'.'+ key.gmtExpired.substr(6,2);            

            tempHTML += '<div class="li"><div class="item">';
            tempHTML +=     '<p><span class="rmb"></span><span class="money">'+ money +'</span>';
            tempHTML +=     ' <span>红包</span></p>';
            tempHTML +=     '<p class="date">有效期:<br />'+ startTime +' - '+ endTime +'</p>';
            tempHTML += '</div></div>';
        }

        redList[0].innerHTML = tempHTML;
    };

    app.showCoupon = function( data, total ) {
        //
        var i = 0,
            key,
            shopUrl = '',
            tempHTML = '',
            dataLen = data.length;

        //
        console.log('第'+ pagenum +'页');

        if ( dataLen < 1 ) {
            //没有数据
            //couponList.html('您还没有领过优惠券，去其它地方逛逛吧！');
            return;
        }

        if ( conSize * pagenum < total ) {
            console.log('oooo');
            divMore.show();

        } else {
            //隐藏更多按钮
            divMore.hide();
        }

        /*if ( dataLen < conSize ) {
            //隐藏更多按钮
            divMore.hide();

        } else {
            divMore.show();
        }*/

        console.log('showCoupon');

        for ( ; i < dataLen; i++ ) {
            key = data[i];

            tempHTML += '<div class="li">';

            //跳转店铺地址
            if ( !!key.jumpUrl ) {
                tempHTML += '<a href="'+ key.jumpUrl +'">';
            } else {
                //未指定jumpUrl
                //店铺类型
                switch( key.shopType ){
                    case '-1':
                        tempHTML += '<a href="#">';
                        break;
                    case '0':
                        tempHTML += '<a href="http://shop.m.taobao.com/shop/shop_index.htm?shop_id='+ key.shopId +'">';
                        break;
                    case '1':
                        tempHTML += '<a href="http://shop.m.tmall.com/shop/shop_index.htm?shop_id='+ key.shopId +'">';
                        break;
                }
            }

            tempHTML +=     '<div class="item item-'+ (i%4 + 1) +'">';
            tempHTML +=         '<div class="cleft">';
            tempHTML +=             '<p class="shopname">'+ key.shopName +'</p>';
            tempHTML +=             '<div class="money"><span class="rmb"></span>'+ key.discount +'</div>';
            tempHTML +=             '<p class="desc">'+ key.condition +'</p>';
            tempHTML +=         '</div>';
            tempHTML +=         '<div class="cright">';
            tempHTML +=             '<p class="limit">使用期限</p>';
            tempHTML +=             '<p class="time">'+ key.startTime +'</p>';
            tempHTML +=             '<p class="time">'+ key.endTime +'</p>';
            tempHTML +=             '<p class="use">立即使用</p>';
            tempHTML +=         '</div>'
            tempHTML +=     '</div>';
            tempHTML += '</a></div>';
        }

        //couponList.html( couponList.html() + tempHTML; );
        couponList[0].innerHTML += tempHTML;
    };


    app.initRedpack = function() {
        //是否登录
        if ( !lib.login.isLogin() ) {
            lib.login.goLogin();
            return;
        }

        //红包初始请求
        lib.mtop.request(
            {
                api: 'mtop.msp.coupon.getMyLuckyMoney',
                v: '1.0',
                data: {}
            },
            function ( dd ) {
                var ret = dd.ret[0],
                    data = dd.data,
                    keyAlipay = data.result,
                    hasAccount,
                    url;

                if ( ret ) {
                    var type = ret.split('::')[0];
                    if ( type === 'SUCCESS' ) {
                        //
                        console.log(data);

                        //取得key
                        if ( keyAlipay ) {
                            //https://lab.alipay.com/user/assets/queryCouponInfo.json?_callback=? //线上正式
                            //http://personal.stable.alipay.net/user/assets/queryCouponInfo.json?_callback=? //日常测试地址

                            //location.host === "waptest.tmall.com"
                            //console.log( 'xhost: '+ location.host.indexOf('xwaptest') );

                            hasAccount = keyAlipay.indexOf('accountNo=null') < 0;

                            //accountNo=null, 无支付宝帐号
                            if ( !hasAccount ) {
                                //提示没有红包
                                //couponList.html( msgMap['error_nodata'] );
                                app.showMsg();
                                return;
                            }

                            ( location.host.indexOf('waptest') < 0 ) ?
                                url = 'https://lab.alipay.com/user/assets/queryCouponInfo.json?_callback=?' :           //线上正式
                                url = 'http://personal.stable.alipay.net/user/assets/queryCouponInfo.json?_callback=?'; //日常测试地址

                            $.ajax({
                                url: url, 
                                dataType: 'jsonp',
                                data: keyAlipay,
                                timeout: 20000,//超时,ms
                                success: function( data ) {

                                    if ( data.stat === 'ok' ) {
                                        var items = data.couponList;

                                        //没有红包
                                        if ( items.length > 1 ) {
                                            //redList.html('<div class="msg">您还没有领过红包，去其它地方逛逛吧！</div>');
                                            app.msgNoRedpack();

                                            //是否为来往用户
                                            lib.mtop.request(
                                                {
                                                    api: 'mtop.msp.coupon.getLaiWangInform',
                                                    v: '1.0',
                                                    data: {}
                                                },
                                                function(data){
                                                    //
                                                    if ( data['data'].laiwangUser === 'true') {
                                                        $('#bnrLaiwang').show();
                                                    } else {
                                                        $('#bnrLaiwang').remove();
                                                    }

                                                    var lwbnr = lib.smartbanner({
                                                        //
                                                        "href": "taobaowebview://m.taobao.com/?weburl="+encodeURIComponent("http://yyz.m.taobao.com/marketing/weifuli02.html"),
                                                        "url": "download.htm",  //安卓app下载页
                                                        "appstoreUrl": ""       //ios app下载页
                                                    });

                                                    $('#bnrLaiwang').on('click', function(){
                                                        //
                                                        //alert('jump laiwang');
                                                        
                                                        lwbnr.show();
                                                    });
                                                },
                                                function(){}
                                            );


                                            //没红包埋点
                                            lib.aplus({
                                                apuri: '',
                                                apdata: ''
                                            });
                                            return;
                                        }

                                        //
                                        redList.html('');
                                        app.showRedpack( items );

                                        //有红包埋点
                                        lib.aplus({
                                            apuri: '',
                                            apdata: ''
                                        });

                                    } else {
                                        //查询接口关闭 or 限流
                                        app.showMsg( msgMap['error_MAX_LIMITED'] );
                                    }
                                },
                                error: function() {
                                    //
                                    app.showMsg( msgMap['error_server'] );
                                }
                            });
                        }

                    } else {
                        //
                        app.showMsg( msgMap['error_getRedpack'] );
                    }
                }

            },
            function ( result ) {
                //
                app.showMsg( msgMap['error_server'] );
            }
        );
    };

    app.initCoupon = function() {
        //是否登录
        if ( !lib.login.isLogin() ) {
            lib.login.goLogin();
            return;
        }

        //优惠券初始请求
        lib.mtop.request(
            {
                api: 'mtop.msp.coupon.getMyCouponList',
                v: '1.0',
                data: {
                    'page': pagenum,
                    'size': conSize
                }
            },
            function ( dd ) {
                //OK 显示

                console.log('ok');

                var ret = dd.ret[0],
                    data = dd.data;

                if ( ret ) {
                    var type = ret.split('::')[0];
                    if ( type === 'SUCCESS' ) {
                        //
                        console.log(data);

                        if ( !data.list ) {
                            //没有优惠券
                            //couponList.html('<div class="msg">您还没有领过优惠券，去其它地方逛逛吧！</div>');
                            //nondata.show();
                            app.showMsg();
                            return;
                        }
                        
                        app.showCoupon( data.list, data.totalNums );

                        //查看更多、返回顶部
                        app.bindMore();

                        //页码增加
                        pagenum += 1;

                    } else {
                        //
                        app.showMsg( msgMap['error_getCoupon'] );
                    }
                }
            },
            function (result) {
                //error
                console.log(result);
                app.showMsg( msgMap['error_server'] );                
            }
        );
    };

    /*document.addEventListener('DOMContentLoaded', function(e) {
        //
    }, false);*/

})(window, window['app'] || (window['app'] = {}));