const axios = require('axios');

module.exports = {
    summary: "the custom rule for AnyProxy.",
    *beforeSendRequest(requestDetail) {
        if (/google/i.test(requestDetail.url))  {
          const newRequestOptions = requestDetail.requestOptions;
          requestDetail.protocol = 'http';
          newRequestOptions.hostname = 'ad.ifeng.com'
          newRequestOptions.port = '80';
          newRequestOptions.path = '/a.html';
          newRequestOptions.method = 'GET';
          return requestDetail;
        }
    },
    *beforeDealHttpsRequest(requestDetail) {
        return true;
    },
    *beforeSendResponse(requestDetail, responseDetail) {
        if (requestDetail.url.indexOf('mp.weixin.qq.com/mp/profile_ext?action=getmsg')!=-1) {
          const newResponse = responseDetail.response;
          let body = newResponse.body.toString('utf-8');
          try{
            let data = JSON.parse(body);
            var url = 'http://127.0.0.1:3000/links/submit';
  
            const general_msg_list = JSON.parse(data.general_msg_list); // 字符串

            axios.post(url,general_msg_list)  
            .then(function (response) {
              return {response:newResponse};
            })
            .catch(function (error) {
              console.log(error);
            });
          }catch(e){
            console.error(e)
          }
           
        }
    }
  };