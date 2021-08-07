const Discord = require('discord.js');
//const { youtube } = require('googleapis/build/src/apis/youtube');
const configs = require('./config.json');
const google = require('googleapis');
const botteste = new Discord.Client();
const youtube = new google.youtube_v3.Youtube({
    version: 'v3',
    auth: configs.GOOGLE_KEY
});


const ytdl = require('ytdl-core');
//const token = configs.TOKEN_DISCORD;
const prefixo = configs.PREFIX;
//const ytdloptions = {filter: 'audioonly'}
const ImageUrl = configs.IMAGEURL;
const servidores = {
    'server': {
        connection: null,
        dispatcher: null,
        fila: [],
        estoutocando: false
    }
}

//sessão pesquisa youtube

    

botteste.on('message', async msg => {

    //sessão de filtros
    if(!msg.guild) return;

    if(!msg.content.startsWith(prefixo)) return;

    const embed = new Discord.MessageEmbed()
            .setColor([216,51,255])
            .setDescription('TOCA DO GABIRU')
            .setImage(ImageUrl)
    msg.channel.send(embed);

    if(!msg.member.voice.channel)
    {
        msg.channel.send('entre em um canal de voz primeiro, seu arrombado ');
        return;
    }

    //sessão de comandos

    //joinar bot
    if(msg.content === prefixo + 'join')
    {
        try
        {
            servidores.server.connection = await msg.member.voice.channel.join();
        }
        catch(err)
        {
            console.log(err);
        }
    }
    //desconectar bot
    if(msg.content === prefixo + 'leave')
    {
        msg.member.voice.channel.leave();
        servidores.server.connection = null;
        servidores.server.dispatcher = null;
    }
    //resumir bot
    if(msg.content === prefixo + 'resume')
    {
        servidores.server.dispatcher.resume();
    }

    //sessão play
    if(msg.content.startsWith(prefixo + 'play'))
    {
        //servidores.server.connection = await msg.member.voice.channel.join();
        let tocarmusica = msg.content.slice(6);
        if(tocarmusica.length === 0)
        {
            msg.channel.send('Preciso de algo para pesquisar, por favor insira algo na alem do &play');
            return;
        }

        if(servidores.server.connection === null)
        {
            try
            {
                servidores.server.connection = await msg.member.voice.channel.join();
            }
            catch(err)
            {
                console.log(err);
            }
        }
        if(ytdl.validateURL(tocarmusica))
        {
            servidores.server.fila.push(tocarmusica);
            console.log('Adicionado: '+ tocarmusica);
        }
        else
        {
            youtube.search.list({
                q: tocarmusica,
                part: 'snippet',
                fields: 'items(id(videoId),snippet(title))',
                type: 'video'
            }, function(err, resultado)
            {
                if(err)
                {
                    console.log(err);
                }
                if(resultado)
                {
                    const id = resultado.data.items[0].id.videoId;
                    const nomemusica = resultado.data.items[0].snippet.title;
                    tocarmusica = 'https://www.youtube.com/watch?v=' + id;
                    servidores.server.fila.push(tocarmusica);
                    console.log('Adicionado: '+ tocarmusica);
                    musicplayer();
                    const embed = new Discord.MessageEmbed()
                        .setColor([216,51,255])
                        .setTitle(nomemusica)
                        msg.channel.send(embed);

                    
                }
            });
        }
        
    }

    //sessão dispatcher
    //pause
    if(msg.content === prefixo + 'pause')
    {
        servidores.server.dispatcher.pause();

    }
    //resume
    if(msg.content === prefixo + 'resume')
    {
        servidores.server.dispatcher.resume();

    }

    //if(msg.content.startsWith(prefixo + 'loop'))
    //{
    //    let tocarmusica = msg.content.slice(6);
    //    servidores.server.dispatcher
    //}
    //skip    
    if(msg.content === prefixo + 'skip')
    {
        servidores.server.dispatcher.end();
        servidores.server.dispatcher = null;
    }


})

musicplayer = () => {

    if(servidores.server.estoutocando === false)
    {
        const tocando = servidores.server.fila[0];
        servidores.server.estoutocando = true;
        servidores.server.dispatcher = servidores.server.connection.play(ytdl(tocando, configs.YTDL));
        servidores.server.dispatcher.on('finish', () => {
            servidores.server.fila.shift();
            servidores.server.estoutocando = false;
            if(servidores.server.fila.length > 0)
            {
                musicplayer();
            }
            else
            {
                servidores.server.dispatcher = null;
            }
    });
    }
}

botteste.login(configs.TOKEN_DISCORD)
botteste.on('ready', () => {
    console.log('estou pronto')
    
})
