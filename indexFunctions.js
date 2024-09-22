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
	addedTimestamp:String,
    //_id: String,
  });

  



mdb_userPlaylistTracks.methods.shortTime = getShortTime;
module.exports = { getPlaylist, getCurrentSong, updateCurrentSong, getShortTime, addSong, rearrangeTracks}
async function getPlaylist(userId){
    
    console.log('userid of getPlaylist call = ' + userId);
    await mongoose.connect('mongodb://127.0.0.1:20713/ethbotDB');

    const userPlaylistTracks = mongoose.model('userPlaylistTracks', mdb_userPlaylistTracks);

    const userPlaylistTrackList = await userPlaylistTracks.find({streamChannel: userId},
        [],
        {
          //  skip:0, // Starting Row
          //  limit:10, // Ending Row
            sort:{
                position: 1 //1 = ascending
            }
        }


    );

    // const userPlaylistTrackList = await userPlaylistTracks.find({streamChannel: userId},[]);


    return userPlaylistTrackList;
}

async function rearrangeTracks(reorderedTracks, userId){

    await mongoose.connect('mongodb://127.0.0.1:20713/ethbotDB');
    const userPlaylistTracks = mongoose.model('userPlaylistTracks', mdb_userPlaylistTracks);

    for (i = 0; i<reorderedTracks.length;i++){
        console.log('rearranging track - ' + reorderedTracks[i].addedTimestamp + ' + ' + reorderedTracks[i].position);
        var updateQuery = userPlaylistTracks.findOneAndUpdate({streamChannel: userId, addedTimestamp: reorderedTracks[i].addedTimestamp}, { position: reorderedTracks[i].position });
        var results = await updateQuery.exec();
        console.log(results);
    }

    // for (const track in reorderedTracks){
        

    // } 
    //mongoose.disconnect();
}


async function getCurrentSong(userid){
    
    console.log('userid of getCurrentSong call = ' + userid);
    await mongoose.connect('mongodb://127.0.0.1:20713/ethbotDB');
    const userCurrentSong = mongoose.model('userCurrentSong', mdb_userPlaylistTracks);


    const currentSong = await userCurrentSong.find({streamChannel: userid});
    console.log(currentSong);
    //mongoose.disconnect();

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
            position: 0,
            addedTimestamp: data[0].addedTimestamp
        });
        newCurrentSong.save();
    });


    console.log('after create in updateCurrentSong');
    //);
    //delete position 1 track for user
    await userPlaylistTracks.deleteOne({streamChannel: userId, position: 1})

    //update (decrement by 1) position for all remaining tracks
    const updateQuery = userPlaylistTracks.updateMany({streamChannel: userId}, { $inc: { position: -1 } });
    const results = await updateQuery.exec();
    console.log(results);

    //mongoose.disconnect();

    return "success";
}

function addSong(newTrack, userId){
    pushPlaylist(newTrack, userId);
}



function getDefaultPlaylist(){

    
}

function addToDefaultPlaylist(){

}

async function pushPlaylist(newTrack, userId){
    console.log(newTrack);
    await mongoose.connect('mongodb://127.0.0.1:20713/ethbotDB');
    const userPlaylistTracks = mongoose.model('userPlaylistTracks', mdb_userPlaylistTracks);

    const newSong = new userPlaylistTracks({ streamChannel: userId, 
        channelTitle: newTrack.channelTitle, 
        duration: newTrack.duration, 
        embeddable: newTrack.embeddable, 
        license: newTrack.license, 
        privacyStatus: newTrack.privacyStatus,
        publicStatsViewable: newTrack.publicStatsViewable,
        requestedBy: newTrack.requestedBy,
        songTitle: newTrack.songTitle,
        uploadStatus: newTrack.uploadStatus,
        videoId: newTrack.videoId,
        position: newTrack.position,
        addedTimestamp: newTrack.addedTimestamp
    });
    await newSong.save();

    //mongoose.disconnect();


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
