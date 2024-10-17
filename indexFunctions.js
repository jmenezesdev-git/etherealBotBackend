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
    //_id: String, field exists but is defined by the database
  });

const mdb_userSettings = new mongoose.Schema({
    lengthLimit: String,
    lengthLimitMod: Boolean,
    songsPerUser: Number,
    songsPerUserMod: Boolean,
    streamChannel: String,
    //_id: String, field exists but is defined by the database
  });

//  const serverConnectionString = "mongodb://127.0.0.1:20713";
   const serverConnectionString = "mongodb://ethbotmongo";
  



mdb_userPlaylistTracks.methods.shortTime = getShortTime;
module.exports = { getPlaylist, getCurrentSong, updateCurrentSong, getShortTime, addSong, rearrangeTracks, deleteDefaultTrack, deletePlaylistTrack, clearPlaylist, updateSettings, getSettings, addDefaultSong, getNextDefaultSong}

async function getPlaylist(userId){
    await ifNotExistCreateSettings(userId);
    console.log('userId of getPlaylist call = ' + userId);
    await mongoose.connect(serverConnectionString + '/ethbotDB');

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
    return userPlaylistTrackList;
}

async function getSettings(userId){
    await ifNotExistCreateSettings(userId);
    await mongoose.connect(serverConnectionString + '/ethbotDB');
    const userSettings = mongoose.model('userSettings', mdb_userSettings);
    var updateQuery = userSettings.findOne({streamChannel: userId});
    var results = await updateQuery.exec();
    console.log(results);
    return results;
}

async function updateSettings(settings, userId){
    console.log("Received call to updateSettings - inside updateSettings");
    await ifNotExistCreateSettings(userId);
    await mongoose.connect(serverConnectionString + '/ethbotDB');
    const userSettings = mongoose.model('userSettings', mdb_userSettings);
    var updateQuery = userSettings.findOneAndUpdate({streamChannel: userId}, { lengthLimit: settings.lengthLimit, lengthLimitMod: settings.lengthLimitMod, songsPerUser: settings.songsPerUser, songsPerUserMod: settings.songsPerUserMod});
    var results = await updateQuery.exec();
    console.log(results);
    return results;

}

async function ifNotExistCreateSettings(userId){
    await mongoose.connect(serverConnectionString + '/ethbotDB');
    const userSettings = mongoose.model('userSettings', mdb_userSettings);
    const retrievedUserSettings = await userSettings.find({streamChannel: userId}).then( async data =>{

        if(data.length == 0) {
            console.log("No record found");

            const newUserSettings = new userSettings({ streamChannel: userId, 
                lengthLimit: '-1', 
                lengthLimitMod: false,
                songsPerUser: -1, 
                songsPerUserMod: false,

            });
            await newUserSettings.save();


            return;
        }
        else{
            console.log("found userSettings");
            return;
        }
    });


}

async function rearrangeTracks(reorderedTracks, userId){
    await mongoose.connect(serverConnectionString + '/ethbotDB');
    const userPlaylistTracks = mongoose.model('userPlaylistTracks', mdb_userPlaylistTracks);

    for (i = 0; i<reorderedTracks.length;i++){
        var updateQuery = userPlaylistTracks.findOneAndUpdate({streamChannel: userId, addedTimestamp: reorderedTracks[i].addedTimestamp}, { position: reorderedTracks[i].position });
        var results = await updateQuery.exec();
    }
}

async function deletePlaylistTrack(track, userId){
    await mongoose.connect(serverConnectionString + '/ethbotDB');
    const userPlaylistTracks = mongoose.model('userPlaylistTracks', mdb_userPlaylistTracks);
    console.log('deleting track - ' + track.addedTimestamp + track.position + ' Requested by - ' + track.requestedBy);
    var updateQuery = userPlaylistTracks.deleteOne({streamChannel: userId, addedTimestamp: track.addedTimestamp, position: track.position, requestedBy: track.requestedBy});
    var results = await updateQuery.exec();
    console.log('deleteResults');
    console.log(results);

    
    const updateQuery2 = userPlaylistTracks.updateMany({streamChannel: userId, position: { $gt: track.position}  }, { $inc: { position: -1 } });
    const results2 = await updateQuery2.exec();
    console.log('updateManyResults');
    console.log(results2);

}

//Untested
async function deleteDefaultTrack(track, userId){
    await mongoose.connect(serverConnectionString + '/ethbotDB');
    const userDefaultTracks = mongoose.model('userDefaultTracks', mdb_userPlaylistTracks);
    console.log('deleting track - ' + track.addedTimestamp + track.songTitle);

    const trackToDelete = await userDefaultTracks.find({streamChannel: userId, addedTimestamp: track.addedTimestamp}).then( async data =>{
        if (data.length > 0){
            
            const updateQuery2 = userDefaultTracks.updateMany({streamChannel: userId, position: { $gt: data[0].position}  }, { $inc: { position: -1 } });
            const results2 = await updateQuery2.exec();
            console.log('updating default track position');
            console.log(results2);
        }
    });

    var updateQuery = userDefaultTracks.deleteOne({streamChannel: userId, addedTimestamp: track.addedTimestamp});
    var results = await updateQuery.exec();
    console.log('deleteResults');
    console.log(results);
    
    
}


async function clearPlaylist(userId){
    await mongoose.connect(serverConnectionString + '/ethbotDB');
    const userPlaylistTracks = mongoose.model('userPlaylistTracks', mdb_userPlaylistTracks);
    console.log('deleting all tracks from ' + userId + ' \'s active playlist');
    var updateQuery = userPlaylistTracks.deleteMany({streamChannel: userId});
    var results = await updateQuery.exec();
    console.log(results);
}


async function getCurrentSong(userId){
    await ifNotExistCreateSettings(userId);
    console.log('userId of getCurrentSongs call = ' + userId);
    await mongoose.connect(serverConnectionString + '/ethbotDB');
    const userCurrentSong = mongoose.model('userCurrentSongs', mdb_userPlaylistTracks);


    const currentSong = await userCurrentSong.find({streamChannel: userId});
    //console.log(currentSong);
    //mongoose.disconnect();

    return currentSong;
}

async function updateCurrentSong(value, userId){ //value is the "new" current song. Use it to validate track choice.

    await ifNotExistCreateSettings(userId);
    var createFromValue = false;
    await mongoose.connect(serverConnectionString + '/ethbotDB');
    const userPlaylistTracks = mongoose.model('userPlaylistTracks', mdb_userPlaylistTracks);
    const userCurrentSong = mongoose.model('userCurrentSongs', mdb_userPlaylistTracks);

    //Set position 1 track for user to the current Song
    await userCurrentSong.deleteOne({ streamChannel: userId });
    const firstPlayListTrack = await userPlaylistTracks.find({streamChannel: userId, position: 1 }).then( async data =>{

    
        if(data.length == 0) {
            console.log("No record found, using provided data.");
            createFromValue = true;
            console.log(value);
        }
        else{
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
            await newCurrentSong.save();
        }
    });

    if (createFromValue){
        const newCurrentSong = new userCurrentSong({ streamChannel: userId, 
            channelTitle: value.channelTitle, 
            duration: value.duration, 
            embeddable: value.embeddable, 
            license: value.license, 
            privacyStatus: value.privacyStatus,
            publicStatsViewable: value.publicStatsViewable,
            requestedBy: value.requestedBy,
            songTitle: value.songTitle,
            uploadStatus: value.uploadStatus,
            videoId: value.videoId,
            position: 0,
            addedTimestamp: value.addedTimestamp
        });

        await newCurrentSong.save();

        console.log('after create in updateCurrentSong');
    }
    else{

        console.log('after create in updateCurrentSong (ELSE)');
        //delete position 1 track for user
        await userPlaylistTracks.deleteOne({streamChannel: userId, position: 1})

        //update (decrement by 1) position for all remaining tracks
        const updateQuery = userPlaylistTracks.updateMany({streamChannel: userId}, { $inc: { position: -1 } });
        const results = await updateQuery.exec();
        console.log(results);
    }

    return "success";
}

async function getNextDefaultSong(userId, trackNo){
    await mongoose.connect(serverConnectionString + '/ethbotDB');
    const userDefaultTracks = mongoose.model('userDefaultTracks', mdb_userPlaylistTracks);
    const userCurrentSong = mongoose.model('userCurrentSongs', mdb_userPlaylistTracks);
    
    await userCurrentSong.deleteOne({ streamChannel: userId });

    const nextDefaultTrack = await userDefaultTracks.find({streamChannel: userId, position: trackNo }).then( data =>{

        if(trackNo == 0 && data.length == 0){
            console.log("No record found");
            return null;
        }
        else if(data.length == 0) {
            return getNextDefaultSong(userId, 0);
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

        return {trackInfo:data[0], trackNo:Number(trackNo) + 1};
    });
    return nextDefaultTrack;
}


async function addSong(newTrack, userId){
    pushPlaylist(newTrack, userId);
}


async function pushPlaylist(newTrack, userId){
    console.log(newTrack);
    await mongoose.connect(serverConnectionString + '/ethbotDB');
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

}

async function getCountExistingDefaultTracksByUser(userId){
    console.log(userId);
    await mongoose.connect(serverConnectionString + '/ethbotDB');
    const userDefaultTracks = mongoose.model('userDefaultTracks', mdb_userPlaylistTracks);
    var results = await userDefaultTracks.find({streamChannel: userId}).countDocuments();
    console.log('Results to follow from getCountExistingDefaultTracksByUser');
    console.log(results);
    if (results != null && results != undefined){
        return results;
    }
    else{
        return results;
    }
}

async function addDefaultSong(newTrack, userId){

    var trackCount = await getCountExistingDefaultTracksByUser(userId);

    await mongoose.connect(serverConnectionString + '/ethbotDB');
    const userDefaultTracks = mongoose.model('userDefaultTracks', mdb_userPlaylistTracks);

    const newSong = new userDefaultTracks({ streamChannel: userId, 
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
        position: trackCount,
        addedTimestamp: newTrack.addedTimestamp
    });
    await newSong.save();
    console.log("saved");
    return "success";
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
