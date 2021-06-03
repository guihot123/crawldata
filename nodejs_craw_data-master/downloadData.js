const fs = require('fs')
const puppeteer = require('puppeteer')
const targtUrl ='https://nhadep.com.vn/thiet-ke-can-ho-186m2-chung-cu-the-legend';

async function getLinks(url,page){
    
    
    await page.goto(url, {waitUntil: 'load',timeout: 0})
    const link_urls = await page.evaluate(() => {
        data = document.querySelectorAll('.dt > h3 >a')
        const links =[...data];
        return links.map(e => e.href);
    });
    return link_urls;  
}

async function getData(page){

    const database = await page.evaluate(() => {
        collectData = document.querySelectorAll('.tbl-cell > p')
        const datas = [...collectData];
        let innerData = datas.map(e=>e.innerHTML);
        //let imageFilter = datas.map( e => e.querySelector('img'));
        //let images = imageFilter.filter( e => e!=null ).map(e => e.src); //importtant
        //let data = innerData.filter((e,i) => images[i]==null); // all collect description
        //data = data.map(e =>  e.replace(/<span[^>]*>/g,'').replace(/<\/span>/g,''));       
        return innerData;       
    });
    return database;
}
function saveData(database){
    let data = [...database];   
    data = data.map(e => e.slice(0,-1)); 
    data= data.map(e =>  e.map( f => f.replace(/<span[^>]*>/g,'').replace(/<\/span>/g,'')))
    data = data.map(e =>  e.map( f => f.replaceAll('&nbsp;','')).filter( h => h!='' ))
    data = data.map(e =>  e.map( f => f.replaceAll('<br>','')).filter( h => h!='' ))
    data = data.map(e =>  e.map( f => f.replace(/<strong[^>]*>/g,'').replace(/<\/strong>/g,'')))
    let databases = data.map(element=>{
          let title = element[0]
          let project = "";
          let style = "";
          let area = "";
          let descriptions = []
          let images =[]
          element.forEach((ee)=>{
              if (ee.includes("Dự án")) project = ee;
              else if (ee.includes("Phong cách")) style = ee;
              else if (ee.includes("Diện tích")) area = ee;
              else if( ee.includes("<img")) {
                let src = ee.split(' ');
                src = [...src];
                src = src.filter( e => e.includes('src'));
                src =src[0].replace("src=",'').replace(/[\\]/, '').replace(/[\n]/, '').replace(/\"/g,'');
                images.push(src)
              }
              else descriptions.push(ee.replace(/[\\]/, ''));
          });       
          let db={
              'title':title.replace('&amp;','').replace(/[\\]/, '').replace(/\n/g, " "),
              'infor':{
                  'project':project.replace(/\n/g, " "),
                  'style':style.replace(/\n/g, " "),
                  'area':area.replace(/\n/g, " ")
              },
              'description':descriptions.shift(),
              'image':images
          }
          return db;
  });
  const fs = require('fs');
  let dataxx = JSON.stringify(databases, null, 4);
  fs.writeFileSync("finaldata.json",dataxx);
}
async function crawData() {
    let url = 'https://nhadep.com.vn/thiet-ke-noi-that';
    const browser = await puppeteer.launch({  
        headless: false,
    });
    const page =await browser.newPage();
    link_urls = await getLinks(url,page);
    console.log(link_urls);
    let datas = []
    for (let i = 0; i < link_urls.length; i++) {
            let url = link_urls[i];
            let browser = await puppeteer.launch({ headless: false });
            let page = await browser.newPage();
            await page.goto($ ,{url}, {waitUntil: 'load',timeout: 0});
            data = await getData(page);
            datas.push(data);
            await browser.close();
    }
    saveData(datas);
};
crawData();