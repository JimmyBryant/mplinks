var express = require('express');
var connect = require('../db/mongodb.js');
const { ObjectId } = require('mongodb');
var router = express.Router();

const colName = 'links';
const colNameTech = 'TechLinks';
const accountList = {
  "MzAwNDMyMzI3Mg":"篮球技巧教学",
  "MzA3MTQ4NjM3MQ":"准者篮球训练营",
  "MzAwNDY2MDUxMA":"只关于篮球",
  "MjM5NDkwMjgwOQ":"贵圈真乱",
  "MzA5NDk4MTAzMw":"野球帝",
  "MzU4Mzg0NjI1Ng":"球鞋志",
  "MzUyMjk4MDc1OQ":"球鞋发售日历",
  "MzUzMzA0MTU0Nw":"篮球绝技",
  "MjM5NjQ5MTI5OA":"美团技术团队",
  "MzU4NzczNjkyMA":"装修第一站",
  "MjM5NTgzNzI1Mg":"筑客HOME",
  "MzA5NTIwNjc5MQ":"住宅公园",
  "MjM5NzQyMzU0MA":"装修效果图",
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  const db = await connect();
  const collection = db.collection(colName);
  const result = await collection.find().toArray();
/*   result.forEach((item,i)=>{
    const content_url = item.content_url;
    if(content_url){
      var match = content_url.match(/__biz=([^&=]*)==&amp;/);
      if(match.length){
        var biz =match[1];
        collection.update({_id:item._id},[{$set:{biz:biz}}],function(err,res){  // 添加biz
          if (err) throw err;
          console.log("1 document updated");
        }); 
      }
    }
  }); */
  res.render('index', { title: 'Express',data:result });
});


router.get('/tech/links', async function(req, res, next) {
  const db = await connect();
  const collection = db.collection(colNameTech);
  const result = await collection.find().toArray();
  console.log(result)
  res.render('index', { title: 'Express',data:result });
});

router.get('/author/list',async function (req,res,next) {
  const db = await connect();
  const collection = db.collection(colName);
  const result = await collection.aggregate([{$match:{'author':{$nin:['']}}},{$group: {"_id" : "$author","count":{"$sum":1}}},{$sort:{'count':-1}}]).toArray();
  console.log('聚合数据',result)
  res.render('index', { title: '作者列表',data:result });
});

router.get('/account/list',async function (req,res,next) {
  const db = await connect();
  const collection = db.collection(colName);
  const result = await collection.aggregate([{$match:{'biz':{$nin:['']}}},{$group: {"_id" : "$biz","count":{"$sum":1}}},{$sort:{'count':-1}}]).toArray();
  result.forEach((item,i)=>{
    var name = accountList[item._id];
    if(name){
      item.name = name;
    }
  });
  console.log('聚合数据',result)
  res.render('index', { title: '公众号列表',data:result });
});

router.get('/account/:author',async function (req,res,next) {
  const author = req.params.author;
  let a = author;
  if(author=='null'){
    a = '';
  }
  const db = await connect();
  const collection = db.collection(colName);
  const result = await collection.find({'biz':a}).toArray();
  res.render('index',{title: '"'+accountList[a]+"("+a+')"的文章列表',data:result});
})

router.get('/links/:author',async function (req,res,next) {
  const author = req.params.author;
  let a = author;
  if(author=='null'){
    a = '';
  }
  const db = await connect();
  const collection = db.collection(colName);
  const result = await collection.find({'author':a}).toArray();
  res.render('index',{title: '"'+author+'"的文章列表',data:result});
})

/**
 * 根据_id删除某条记录
 */
router.get('/links/delete/:id',async function(req,res,next){
  const id = req.params.id;
  const db = await connect();
  const collection = db.collection(colName);
  if(id){
    collection.deleteOne({"_id":ObjectId(id)},function(err,result){
      if (err){throw err;res.send({code:500})}
      res.send({code:200});
    })
  }
})

router.post('/links/submit',async function (req,res,next) {  

  const data = req.body;

  if(data&&data.list){
    const arr = [];
   
    var biz = '';
    data.list.forEach(element => {     
      with (element.app_msg_ext_info){
        if(title&&content_url){
          var match = content_url.match(/__biz=([^&=]*)==&amp;/);
          if(match.length){
            biz =match[1];
          }
          const obj = {
            title: title,
            digest:digest,
            content_url:content_url,
            cover:cover,
            author: author,
            biz: biz,
          }
          arr.push(obj);
        }
      }
      const multi_app_msg_item_list= element.app_msg_ext_info.multi_app_msg_item_list;
      if(multi_app_msg_item_list&&multi_app_msg_item_list.length){
        multi_app_msg_item_list.forEach(element=>{
          with(element){
            var match = content_url.match(/__biz=([^&=]*)==&amp;/);
            if(match.length){
              biz =match[1];
            }
            const obj = {
              title: title,
              digest:digest,
              content_url:content_url,
              cover:cover,
              author: author,
              biz: biz,
            }
            arr.push(obj);
          }
        });
      }
    });
    const db = await connect();
    const collection = db.collection(colName);
    collection.insertMany(arr,{ordered:false},function (err,result) {
      if(err){
        console.error(err);
      }else{
        console.log("数据插入成功",result);
      }
      
      res.send(result)
    })    
    
  }else{
    res.send(data);
  }
});

module.exports = router;
