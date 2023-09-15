import React, { useEffect, useState, forwardRef, useCallback } from "react";

export const Game = forwardRef((props, ref) => {
    // eslint-disable-next-line no-unused-vars
    const { ws, game, network, chat, connected, error } = props;

    // websocket messages
    const placeDisk = (team, col) => {
        if (!ws.current) return;
        ws.current.send(JSON.stringify({"ActionType": "PlaceDisk", "Team": team, "MoreDetails": {"Column": col}}));
    }

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

    const handleResize = useCallback(() => {
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
    }, [ref])

    useEffect(() => handleResize());

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return _ => window.removeEventListener("resize", handleResize)
    }, [handleResize]);

    return (
        <div className="w-full h-full flex flex-col justify-center items-center grow">
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
    )
})
