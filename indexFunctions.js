const mongoose = require('mongoose');

const mdb_userPlaylistTracks = new mongoose.Schema({
    uploadStatus: String,
    failureReason: Number, 
    rejectionReason: String, 
    privacyStatus: String, 
    license: String, 
    embeddable: Boolean, 
    publicStatsViewable: Boolean, 
    duration: String, 
    songTitle: String, 
    channelTitle: String, 
    videoId: String, 
    requestedBy: String,
    position: Number,
    streamChannel: String, 
    //_id: String,
  });
mdb_userPlaylistTracks.methods.shortTime = getShortTime;
module.exports = { getPlaylist, getCurrentSong, updateCurrentSong, getShortTime}
async function getPlaylist(userid){
    
    console.log('userid of getPlaylist call = ' + userid);
    await mongoose.connect('mongodb://127.0.0.1:20713/ethbotDB');

    const userPlaylistTracks = mongoose.model('userPlaylistTracks', mdb_userPlaylistTracks);
    /*const silence = new userPlaylistTracks({ streamChannel: 'etherealAffairs', 
                                        channelTitle: "幽閉サテライト・少女フラクタル・幽閉カタルシス 公式チャンネル", 
                                        duration: "PT5M56S", 
                                        embeddable: true, 
                                        license: "youtube", 
                                        privacyStatus: "public",
                                        publicStatsViewable: true,
                                        requestedBy: "etherealAffairs",
                                        songTitle: "【公式】【東方Vocal】幽閉サテライト / 華鳥風月/歌唱senya【FullMV】（原曲：六十年目の東方裁判 ～ Fate of Sixty Years）",
                                        uploadStatus: "processed",
                                        videoId: "gXCI8vJTjqA",
                                        position: 1
                                    });*/
    //console.log(silence.songTitle);
    //console.log(silence.shortTime());
    //await silence.save(); 

    const userPlaylistTrackList = await userPlaylistTracks.find({streamChannel: userid});
    //console.log(userPlaylistTrackList);
    mongoose.disconnect();

    return userPlaylistTrackList;
}

async function getCurrentSong(userid){
    
    console.log('userid of getCurrentSong call = ' + userid);
    await mongoose.connect('mongodb://127.0.0.1:20713/ethbotDB');
    const userCurrentSong = mongoose.model('userCurrentSong', mdb_userPlaylistTracks);


    const currentSong = await userCurrentSong.find({streamChannel: userid});
    console.log(currentSong);
    mongoose.disconnect();

    return currentSong;
}

async function updateCurrentSong(value, userId){ //value is the "new" current song. Use it to validate track choice.
    //Never Gonna...
    //Never Gonna...
    //Never Gonna...
    //console.log('value of updateCurrentSong call = ');
    //console.log(value);
    await mongoose.connect('mongodb://127.0.0.1:20713/ethbotDB');
    const userPlaylistTracks = mongoose.model('userPlaylistTracks', mdb_userPlaylistTracks);
    const userCurrentSong = mongoose.model('userCurrentSong', mdb_userPlaylistTracks);

    //Set position 1 track for user to the current Song
    await userCurrentSong.deleteOne({ streamChannel: userId });
    const firstPlayListTrack = await userPlaylistTracks.find({streamChannel: userId, position: 1 }).then( data =>{

    
        if(data.length == 0) {
            console.log("No record found")
            return
        }
    
        const newCurrentSong = new userCurrentSong({ streamChannel: userId, 
            channelTitle: data[0].channelTitle, 
            duration: data[0].duration, 
            embeddable: data[0].embeddable, 
            license: data[0].license, 
            privacyStatus: data[0].privacyStatus,
            publicStatsViewable: data[0].publicStatsViewable,
            requestedBy: data[0].requestedBy,
            songTitle: data[0].songTitle,
            uploadStatus: data[0].uploadStatus,
            videoId: data[0].videoId,
            position: 0
        });
        newCurrentSong.save();
    });


    console.log('after create in updateCurrentSong');
    //);
    //delete position 1 track for user
    await userPlaylistTracks.deleteOne({streamChannel: userId, position: 1})

    //update (decrement by 1) position for all remaining tracks
    // const userPlaylist = 
    await userPlaylistTracks.find({streamChannel: userId}).then( userPlaylist => {
        console.log(userPlaylist.length);
        if (userPlaylist.length > 0){
            console.log('playlist length > 0');
            console.log(userPlaylist);
            if (userPlaylist[0].position != null && userPlaylist[0].position != undefined){
                console.log('we have a track position');
                const tPos = userPlaylist[0].position - 1;
                console.log('tPos = ' +tPos + ' _id = ' + userPlaylist[0]._id);
                //var temp = userPlaylistTracks.findByIdAndUpdate(userPlaylist[0]._id, {position: tPos});
                const doc = userPlaylistTracks.findById(userPlaylist[0]._id)
                doc.position = tPos;
                doc.save();
            }
        
        }

    });

    
    

    //mongoose.save();
    mongoose.disconnect();
    return "success";
}




function getDefaultPlaylist(){

    
}

function addToDefaultPlaylist(){

}

function pushPlaylist(){
    
}

function popPlaylist(){

}

function removeAtIndex(){

}


function getShortTime(){
    var days = 0;
    var hours = 0;
    var minutes = 0;
    var seconds = 0;
    const regexp = /PT((\d+)DT)?((\d+)H)?((\d+)M)?(\d+)S/g;

    if (this.duration != null && this.duration != undefined && this.duration.length > 0){
        let matches = this.duration.matchAll(regexp);
        for (const match of matches) {
            if (match.length > 7){
                if(match[2] != undefined){
                    days += Number(match[2]);
                }
                if (match[4] != undefined){
                    hours += Number(match[4]);
                }
                if (match[6] != undefined){
                    minutes += Number(match[6]);
                }
                if (match[7] != undefined){
                    seconds += Number(match[7]);
                }
            }
        }
        
        var returnString = "";
        if (days > 0){
            returnString += days + " d";
        }
        if (hours > 0){
            if (returnString.length > 0){
                returnString += " ";
            }
            returnString += hours + "h";
        }
        if (minutes > 0){
            if (returnString.length > 0){
                returnString += " ";
            }
            returnString += minutes + "m";
        }
        if (seconds > 0){
            if (returnString.length > 0){
                returnString += " ";
            }
            returnString += seconds + "s";
        }
        return returnString;

    }

    return "0 seconds";
}
