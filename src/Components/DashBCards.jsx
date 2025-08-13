const DashBCards = (props) => {
    const { DashBCardInfo } = props;
    console.log(DashBCardInfo);

    return (
        <li className="rounded-xl p-5 flex justify-around align-middle gap-0.3 bg-white shadow-xs shadow-gray-400 transition-all duration-120 hover:scale-101 hover:shadow-md hover:shadow-gray-400">
            <div className="flex flex-col text-left gap-1">
                <h5 className="font-normal text-md text-[#657086]">{DashBCardInfo.label}</h5>
                <p className="font-bold text-2xl text-[#090A0C]">{DashBCardInfo.number}{DashBCardInfo.units}</p>
                <span className="flex justify-start align-middle place-items-center gap-1 max-w-max wrap-break-word">
                    <img src="/icons/uprise-icon.png" alt="img1" className="w-[15px] object-contain" />
                    <span className="text-[12px] min-w-max wrap-normal">{DashBCardInfo.rateValue}{DashBCardInfo.units}</span>
                    <p className="font-thin m-0 p-0 text-sm text-[#657086]">from last week</p>
                </span>
            </div>
            <img src={DashBCardInfo.icon} alt="icon1"
                className={`w-full max-w-[40px] self-center object-contain aspect-square p-2.5 rounded-md icon-bg-${DashBCardInfo.bgColor}`}
            />
        </li>
    )
}

export default DashBCards
