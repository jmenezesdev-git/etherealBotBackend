var indexFunctions = require('./indexFunctions');
const mongoose = require('mongoose');
const express=require('express');
const app=express();
const port = 3000

// const mdb_userPlaylistTracks = new mongoose.Schema({
//     uploadStatus: String,
//     failureReason: Number, 
//     rejectionReason: String, 
//     privacyStatus: String, 
//     license: String, 
//     embeddable: Boolean, 
//     publicStatsViewable: Boolean, 
//     duration: String, 
//     songTitle: String, 
//     channelTitle: String, 
//     videoId: String, 
//     requestedBy: String,
//     position: Number,
//     streamChannel: String, 
//     addedTimestamp:String,
//   });



const cors=require("cors");
const corsOptions ={
   origin:'*',
   credentials:true,
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) 
app.use(express.json())


// urgentcall();

// function sleep(ms) {
//     return new Promise((resolve) => {
//       setTimeout(resolve, ms);
//     });
//   }

// async function urgentcall(){
//     await mongoose.connect('mongodb://127.0.0.1:20713/ethbotDB');
    
//     var tempDate = Date().toString();
//     const userPlaylistTracks = mongoose.model('userPlaylistTracks', mdb_userPlaylistTracks);
// const silence = new userPlaylistTracks({ streamChannel: 'etherealAffairs', 
//                                         channelTitle: "幽閉サテライト・少女フラクタル・幽閉カタルシス 公式チャンネル", 
//                                         duration: "PT5M56S", 
//                                         embeddable: true, 
//                                         license: "youtube", 
//                                         privacyStatus: "public",
//                                         publicStatsViewable: true,
//                                         requestedBy: "etherealAffairs",
//                                         songTitle: "【公式】【東方Vocal】幽閉サテライト / 華鳥風月/歌唱senya【FullMV】（原曲：六十年目の東方裁判 ～ Fate of Sixty Years）",
//                                         uploadStatus: "processed",
//                                         videoId: "gXCI8vJTjqA",
//                                         position: 1,
//                                         addedTimestamp: tempDate
//                                     });
    
//     await silence.save(); 
//     await sleep(1000);
//     tempDate = Date().toString();
//     const silence2 = new userPlaylistTracks({ streamChannel: 'etherealAffairs', 
//         channelTitle: "Rammstein Official", 
//         duration: "PT3M56S", 
//         embeddable: true, 
//         license: "youtube", 
//         privacyStatus: "public",
//         publicStatsViewable: true,
//         requestedBy: "etherealAffairs",
//         songTitle: "Rammstein - Du Hast (Official 4K Video)",
//         uploadStatus: "processed",
//         videoId: "W3q8Od5qJio",
//         position: 2,
//         addedTimestamp: tempDate
//     });


// await sleep(1000);
// await silence2.save(); 
// tempDate = Date().toString();
// const silence3 = new userPlaylistTracks({ streamChannel: 'etherealAffairs', 
//     channelTitle: "Iced Earth - Topic", 
//     duration: "PT3M48S", 
//     embeddable: true, 
//     license: "youtube", 
//     privacyStatus: "public",
//     publicStatsViewable: true,
//     requestedBy: "etherealAffairs",
//     songTitle: "I Died For You",
//     uploadStatus: "processed",
//     videoId: "EqQCfC7KHlQ",
//     position: 3,
//     addedTimestamp: tempDate
// });
// console.log(tempDate);

// await silence3.save(); 
//     mongoose.disconnect();

// }
//const data = require('./data.json');

//FrontEnd Server - 4200
//BackEnd Server - 3000
//DB - 20713

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })

app.get('/playlist', async (req, res) => {
    console.log('received request to Playlist');
    if (req.query != null && req.query != undefined){
        
        if (req.query.userid != null && req.query.userid != undefined){
            console.log(req.query);
            playlist = await indexFunctions.getPlaylist(req.query.userid);
            res.send({data: playlist});
        }
    }
    
    if (req.headers != null && req.headers != undefined){
        if (req.headers.authorization != null && req.headers.authorization != undefined){
            console.log('req.headers.authorization');
            console.log(req.headers.authorization);
        }
    }
  })

app.get('/currentSong', async (req, res) => {
    console.log('received request to CurrentSong');
    if (req.query != null && req.query != undefined){
        
        if (req.query.userid != null && req.query.userid != undefined){
            console.log(req.query);
            playlist = await indexFunctions.getCurrentSong(req.query.userid);
            res.send({data: playlist});
        }
    }

    if (req.headers != null && req.headers != undefined){
        if (req.headers.authorization != null && req.headers.authorization != undefined){
            console.log('req.headers.authorization');
            console.log(req.headers.authorization);
        }
    }
})

app.post('/currentSong', async (req, res) => {
    console.log('received post to CurrentSong');
    console.log(req.body);
    console.log(req.newCurrentSong);
    // console.log(req);
    if (req.body != null && req.body != undefined){
        
        if (req.body.newCurrentSong != null && req.body.newCurrentSong != undefined && req.body.userId != undefined && req.body.userId != undefined){
            // console.log(req.body);
            playlist = await indexFunctions.updateCurrentSong(req.body.newCurrentSong, req.body.userId);
            res.send('New Current song successfully set.');
        }
    }
    
    if (req.headers != null && req.headers != undefined){
        if (req.headers.authorization != null && req.headers.authorization != undefined){
            console.log('req.headers.authorization');
            console.log(req.headers.authorization);
        }
    }
})

app.post('/addSong', async (req, res) => {
    console.log('received post to Add Song');
    console.log(req.body);
    console.log(req.body.newTrack);
    // console.log(req);
    if (req.body != null && req.body != undefined){
        
        if (req.body.newTrack != null && req.body.newTrack != undefined && req.body.userId != undefined && req.body.userId != undefined){
            // console.log(req.body);
            playlist = await indexFunctions.addSong(req.body.newTrack, req.body.userId);
            res.send('Successfully added new song.');
        }
    }
    
    if (req.headers != null && req.headers != undefined){
        if (req.headers.authorization != null && req.headers.authorization != undefined){
            console.log('req.headers.authorization');
            console.log(req.headers.authorization);
        }
    }
})

app.post('/rearrangeSongs', async (req, res) => {
    console.log('received post to Rearrange Songs');
    console.log(req.body);
    console.log('ReorderedTracks var =');
    console.log(req.body.reorderedTracks);
    // console.log(req);
    if (req.body != null && req.body != undefined){
        
        if (req.body.reorderedTracks != null && req.body.reorderedTracks != undefined && req.body.userId != undefined && req.body.userId != undefined){
            // console.log(req.body);
            playlist = await indexFunctions.rearrangeTracks(req.body.reorderedTracks, req.body.userId);
            res.send('Successfully rearranged songs.');
        }
    }
    
    if (req.headers != null && req.headers != undefined){
        if (req.headers.authorization != null && req.headers.authorization != undefined){
            console.log('req.headers.authorization');
            console.log(req.headers.authorization);
        }
    }
})


app.get('/', (req, res) => {
res.send('This server is not dead yet!')
})


