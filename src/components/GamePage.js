import React, { useEffect, useRef, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { CONFIG } from "../components/Config";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router-dom";
import { isMobile } from "react-device-detect";

export default function GamePage() {
    const history = useHistory();
    const { gid } = useParams();

    // websocket connectivity logic 
    const ws = useRef();
    const [game, setGame] = useState();
    const [network, setNetwork] = useState();
    // const [chat, setChat] = useState([]);
    const [connected, setConnected] = useState();
    // const [error, setError] = useState();

    useEffect(() => {
        ws.current = new WebSocket(`ws${ CONFIG.scheme }://${ CONFIG.host }/game/join?GameKey=${ CONFIG.key }&GameID=${ gid }`);
        ws.current.onopen = () => {};
        ws.current.onclose = () => history.push("/");
        ws.current.onmessage = async e => {
            let msg = JSON.parse(e.data);
            if (msg.Type === "Game") setGame(msg.Payload);
            else if (msg.Type === "Network") setNetwork(msg.Payload);
            // else if (msg.Type === "Chat") setChat(c => c.concat([msg.Payload]));
            else if (msg.Type === "Connected") setConnected(msg.Payload);
            // else if (msg.Type === "Error") setError(msg.Payload);
        };
        ws.current.onerror = () => history.push("/");
    }, [ws, history, gid]);

    // websocket messages
    const setTeam = (team) => {
        if (!ws.current) return;
        ws.current.send(JSON.stringify({"ActionType": "SetTeam", "MoreDetails": {"Team": team}}));
    }

    const resetGame = () => {
        if (!ws.current) return;
        ws.current.send(JSON.stringify({"ActionType": "Reset"}));
    }

    const placeDisk = (team, col) => {
        if (!ws.current) return;
        ws.current.send(JSON.stringify({"ActionType": "PlaceDisk", "Team": team, "MoreDetails": {"Column": col}}));
    }

    // trigger used to force a refresh of the page
    const [trigger, setTrigger] = useState(true);
    useEffect(() => {
        const handleResize = () => setTrigger(!trigger);
        window.addEventListener("resize", handleResize);
        return _ => window.removeEventListener("resize", handleResize)
    });

    // copied logic
    const [copied, setCopied] = useState(0);
    useEffect(() => {
        if (copied > 0) setTimeout(() => setCopied(copied-1), 1000);
    }, [copied]);

    // game data
    const [board, setBoard] = useState([]);
    useEffect(() => {
        if (game && game.MoreData) setBoard(game.MoreData.Board)
    }, [game])

    // network data
    const [team, setCurrentTeam] = useState("");
    useEffect(() => {
        if (network && connected) setCurrentTeam(connected[network.Name])
    }, [network, connected])

    // board must stay at a 7x6 width to height ratio
    const [tileSize, setTileSize] = useState(0);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const ref = useRef(null);
    function handleResize() {
        const width = 7.5;
        const height = 6.5;
        if (!ref || !ref.current) return;
        if (ref.current.clientHeight/height < ref.current.clientWidth/width) {
            setWidth(ref.current.clientHeight/height*width);
            setHeight(ref.current.clientHeight);
            setTileSize(ref.current.clientHeight/height);
        } else {
            setWidth(ref.current.clientWidth);
            setHeight(ref.current.clientWidth/width*height);
            setTileSize(ref.current.clientWidth/width);
        }
    }
    useEffect(() => handleResize());
    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return _ => window.removeEventListener("resize", handleResize)
    }, []);

    return (
        <div className="h-full flex flex-col items-center select-none">
            {/* TAILWIND HACK - Tailwind preloads only used classes so anything not in initial render will not work */}
            <div className="text-red-500 text-blue-500 text-green-500 text-yellow-500 text-orange-500 text-pink-500 text-purple-500 text-teal-500"/>
            <div className="border-red-500 border-blue-500 border-green-500 border-yellow-500 border-orange-500 border-pink-500 border-purple-500 border-teal-500"/>
            <div className="bg-red-500 bg-blue-500 bg-green-500 bg-yellow-500 bg-orange-500 bg-pink-500 bg-pink-500 bg-purple-500 bg-teal-500"/>
            <div className="fill-red-500 fill-blue-500 fill-green-500 fill-yellow-500 fill-orange-500 fill-pink-500 fill-pink-500 fill-purple-500 fill-teal-500"/>
            {/* END HACK */}
            <div className="relative w-full mb-1 justfy-self-start font-thin text-sm">
                Share this link with friends:&nbsp;
                <span className="underline cursor-pointer" onClick={() => {
                    setCopied(1);
                    navigator.clipboard.writeText(`${ window.location.protocol }//${ window.location.host }/${ gid }`)
                }}>
                    { `${ window.location.protocol }//${ window.location.host }/${ gid }` }
                </span>
                {
                    copied > 0 ?
                        <div className="absolute mt-2 w-full flex justify-center">
                            <div className="absolute top-[-12px] w-6 overflow-hidden inline-block">
                                <div className=" h-4 w-4 bg-zinc-600 rotate-45 transform origin-bottom-left" />
                            </div>
                            <div className="font-bold text-xs text-center bg-zinc-600 px-2 py-1">copied!</div>
                        </div> : null
                }
            </div>
            <hr className="w-full mb-2"/>
            <div className="flex w-full justify-between items-center mb-4">
                <div className="flex">
                    { game ? game.Teams.map(el => <div key={ el } className={ `cursor-pointer mr-1 w-6 h-6 rounded-full border-4 border-${ el }-500 ${ network && connected && connected[network.Name] === el  ? `bg-${ connected[network.Name] }-500` : "" }` } onClick={ () => setTeam(el) }/>) : null }
                </div>
                <div className={ `font-extrabold ${ game && connected && network && connected[network.Name] && game.Winners.length === 0 ? `text-${ game.Turn }-500` : "text-zinc-100" }` }>
                    { 
                        game && connected && network && connected[network.Name] ? 
                            game.Message : 
                            <div className="flex items-center">
                                <BsArrowLeft className="mr-1" />
                                <div>select a team</div>
                            </div>
                    }
                </div>
            </div>

            <DndProvider backend={ isMobile ? TouchBackend : HTML5Backend }>
                <div ref={ref} className="w-full h-full flex flex-col justify-center items-center grow">
                    <div className="flex flex-col justify-center rounded-3xl overflow-hidden bg-slate-200" style={{width: `${width}px`, height: `${height}px`}}>
                    {
                        board.map((row, rIdx) =>
                            <div key={rIdx} className="w-full flex justify-center" style={{height: `${tileSize}px`}}>
                                {
                                    row.map((token, cIdx) =>
                                    <div key={`${rIdx},${cIdx}`} className="flex items-center justify-center cursor-pointer" style={{width: `${tileSize}px`, height: `${tileSize}px`}} onClick={() => placeDisk(team, cIdx)}>
                                        <div className={`w-[90%] h-[90%] rounded-full ${token ? `bg-${token}-500` : "bg-zinc-800"}`}/>
                                    </div>)
                                }
                            </div>
                        )
                    }
                    </div>
                </div>
            </DndProvider>

            <hr className="w-full mb-2"/>
            <div className="w-full flex justify-between items-center">
                <div className="title leading-4 text-2xl font-black text-red-600 cursor-pointer">
                    <a href={ `${ window.location.protocol }//${ window.location.host }` }>Connect<span className="text-blue-600">4</span></a>
                </div>
                <div className="flex">
                    <div className="flex">
                        <div className="px-3 py-1 font-bold cursor-pointer flex items-center justify-center text-xs bg-zinc-600 mr-2" onClick={ () => resetGame() }>new game</div>
                    </div>
                    <div className="italic text-xs bg-blue-500 py-1 px-2">
                        <a href="https://quibbble.com">more <span className="quibbble text-sm not-italic">quibbble</span> games</a>
                    </div>
                </div>
            </div>
        </div>
        )
}
