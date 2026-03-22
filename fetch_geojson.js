import fs from 'fs';
import https from 'https';

const gbaUrl = "https://raw.githubusercontent.com/mgaitan/departamentos_argentina/master/departamentos-buenos_aires.json";
const cabaUrl = "https://raw.githubusercontent.com/mgaitan/departamentos_argentina/master/departamentos-ciudad_autonoma_de_buenos_aires.json";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0'} }, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
         try { resolve(JSON.parse(body)); } 
         catch(e) { reject(new Error("Invalid JSON from " + url + ": " + body.substring(0, 100))); }
      });
    }).on("error", reject);
  });
}

async function run() {
  try {
    const gba = await fetchJson(gbaUrl);
    const caba = await fetchJson(cabaUrl);
    
    const features = [];
    
    // CABA handling
    if (caba && caba.features) {
      caba.features.forEach(f => {
        const dep = f.properties.departamen ? f.properties.departamen.toLowerCase() : "";
        if (dep.includes("12") || dep.includes("13") || dep.includes("14") || dep.includes("15") || dep.includes("comuna 2")) {
          f.properties.zone = 1;
        } else {
          f.properties.zone = 2;
        }
        features.push(f);
      });
    }
    
    // GBA Handling
    if (gba && gba.features) {
      gba.features.forEach(f => {
        const name = f.properties.departamen ? f.properties.departamen.toLowerCase() : "";
        
        if (name.includes("vicente")) {
          f.properties.zone = 0;
          features.push(f);
        } else if (name.includes("isidro") || name.includes("fernando")) {
          f.properties.zone = 1;
          features.push(f);
        } else if (name.includes("pilar") || name.includes("tigre")) {
          f.properties.zone = 3;
          features.push(f);
        } else if (name.includes("lanus") || name.includes("lanús") || name.includes("matanza") || name.includes("zamora") || 
                   name.includes("moron") || name.includes("morón") || name.includes("febrero") || name.includes("avellaneda") || 
                   name.includes("quilmes") || name.includes("san m") || name.includes("san j") || name.includes("ituzaing") || 
                   name.includes("hurlingham") || name.includes("ezeiza") || name.includes("esteban") || name.includes("almirante") || 
                   name.includes("varela") || name.includes("beraza") || name.includes("merlo") || name.includes("moreno") || 
                   name.includes("paz") || name.includes("malvinas") || name.includes("ense") || name.includes("berisso") || name.includes("plata")) {
          f.properties.zone = 2;
          features.push(f);
        }
      });
    }

    const fc = { type: "FeatureCollection", features };
    fs.writeFileSync("public/zonas.geojson", JSON.stringify(fc));
    console.log("GeoJSON saved with", features.length, "features.");
  } catch(e) {
    console.error("Error:", e.message);
  }
}

run();
