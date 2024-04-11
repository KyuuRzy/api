const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const cheerio = require("cheerio");
  
const app = express();
const PORT = process.env.PORT || 3000;
app.enable("trust proxy");
app.set("json spaces", 2);

// Middleware untuk CORS
app.use(cors());

async function instadown(url) {
	return new Promise(async (resolve, reject) => {
		try {
			var a = await axios.request("https://snapinsta.app/action2.php?lang=id", {
				method: "POST",
				headers: {
					"user-agent": "Mozilla/5.0 (Linux; Android 11; V2038; Flow) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/359.0.0.288 Mobile Safari/537.36",
					origin: 'https://snapinsta.app',
					referer: 'https://snapinsta.app/',
					Host: "snapinsta.app",
					"content-type": "application/x-www-form-urlencoded",
					accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
				},
				data: new URLSearchParams({
					url: url,
					action: "post"
				})
			})
			var decodeParams = a.data.split('))</script>')[0]
				.split('decodeURIComponent(escape(r))}(')[1]
				?.split(',')?.map(v => v.replace(/^"/, '')
					.replace(/"$/, '').trim())
			if (!Array.isArray(decodeParams) || decodeParams.length !== 6) return reject({
				status: false,
				message: `failed to parse decode params!\n${a.data}`
			})

			var decode = await decodeSnap(...decodeParams)
			var result = decode?.split('("download").innerHTML = "')?.[1].split('; document.getElementById')[0].replaceAll("\\","")
				log(result)
			const $ = cheerio.load(result)

			const results = []
			$('.download-content').each(function() {
				let thumbnail = $(this)
					.find('.media-box > img[src]')
					.attr('src')
				if (!/https?:\/\//i.test(thumbnail)) thumbnail = 'https://snapinsta.app' + thumbnail
				let url = $(this).find('.download-bottom > a[href]').attr('href')
				if (!/https?:\/\//i.test(url || '')) {
					url = encodeURI('https://snapinsta.app' + url)
				}
				if (url) results.push({
					thumbnail,
					url
				})
			})
			return resolve({
				status: true,
				data: results
			})
		} catch (e) {
			console.log(e)
			if (e.response) {
				return resolve({
					status: false,
					message: e.response.statusText
				})
			} else {
				return resolve({
					status: false,
					message: e
				})
			}
		}
	})
}

function pinterestvideodownloader(t) {
  return new Promise(async (e, a) => {
    let i = new URLSearchParams();
    i.append("url", t);
    let o = await (
      await fetch("https://pinterestvideodownloader.com/", {
        method: "POST",
        body: i,
      })
    ).text();
    $ = cheerio.load(o);
    let r = [];
    if (
      ($("table > tbody > tr").each(function (t, e) {
        "" != $($(e).find("td")[0]).text() &&
          r.push({ url: $($(e).find("td")[0]).find("a").attr("href") });
      }),
      0 == r.length)
    )
      return e({ status: !1 });
    e({ status: !0, data: r });
  });
}

function tiktokdl(URL) {
    return new Promise(async(resolve, rejecet) => {
        let { data } = await axios.request({
            url: "https://lovetik.com/api/ajax/search",
            method: "POST",
            data: new URLSearchParams(Object.entries({ query: URL }))
        })
        let result = {
            desc: data.desc,
            author: data.author,
            author_name: data.author_name,
            cover: data.cover,
            video: data.play_url,
            audio: data.links[4].a || "".replace("https", "http")
        }
        resolve(result)
    })
}


// Fungsi untuk ragBot
async function ragBot(message) {
  try {
    const response = await axios.post('https://ragbot-starter.vercel.app/api/chat', {
      messages: [{ role: 'user', content: message }],
      useRag: true,
      llm: 'gpt-3.5-turbo',
      similarityMetric: 'cosine'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Fungsi untuk degreeGuru
async function degreeGuru(message, prompt) {
  try {
    const response = await axios.post('https://degreeguru.vercel.app/api/guru', {
      messages: [
        { role: 'user', content: message }
      ]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Fungsi untuk pinecone
async function pinecone(message) {
  try {
    const response = await axios.post('https://pinecone-vercel-example.vercel.app/api/chat', {
      messages: [{ role: 'user', content: message }]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Fungsi untuk smartContract
async function smartContract(message) {
  try {
    const response = await axios.post("https://smart-contract-gpt.vercel.app/api/chat", {
      messages: [{ content: message, role: "user" }]
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

async function blackboxAIChat(message) {
  try {
    const response = await axios.post('https://www.blackbox.ai/api/chat', {
      messages: [{ id: null, content: message, role: 'user' }],
      id: null,
      previewToken: null,
      userId: null,
      codeModelMode: true,
      agentMode: {},
      trendingAgentMode: {},
      isMicMode: false,
      isChromeExt: false,
      githubToken: null
    });

    return response.data;
  } catch (error) {
    throw error;
  }
}

// Endpoint PinVideo
app.get('/api/instadl', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await instadown(url);
    res.status(200).json({
      status: 200,
      creator: "Hyuu",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.url });
  }
});

// Endpoint PinVideo
app.get('/api/pinvideo', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await pinterestvideodownloader(url);
    res.status(200).json({
      status: 200,
      creator: "Hyuu",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.url });
  }
});

// Endpoint TikTokDl
app.get('/api/tiktokdl', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "url" tidak ditemukan' });
    }
    const response = await tiktokdl(message);
    res.status(200).json({
     status: 200,
      creator: "KyuuRzy",
      data: { response } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk servis dokumen HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint untuk ragBot
app.get('/api/ragbot', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await ragBot(message);
    res.status(200).json({
      status: 200,
      creator: "KyuuRzy",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk degreeGuru
app.get('/api/degreeguru', async (req, res) => {
  try {
    const { message }= req.query;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await degreeGuru(message);
    res.status(200).json({
      status: 200,
      creator: "KyuuRzy",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk pinecone
app.get('/api/pinecone', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await pinecone(message);
    res.status(200).json({
      status: 200,
      creator: "KyuuRzy",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk smartContract
app.get('/api/smartcontract', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await smartContract(message);
    res.status(200).json({
      status: 200,
      creator: "KyuuRzy",
      data: {response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint untuk blackboxAIChat
app.get('/api/blackboxAIChat', async (req, res) => {
  try {
    const message = req.query.message;
    if (!message) {
      return res.status(400).json({ error: 'Parameter "message" tidak ditemukan' });
    }
    const response = await blackboxAIChat(message);
    res.status(200).json({
      status: 200,
      creator: "KyuuRzy",
      data: { response }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Handle 404 error
app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

// Handle error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app
