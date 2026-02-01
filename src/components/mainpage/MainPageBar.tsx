import {CheckLineIcon, EditIcon} from "../../icons";


const bar = [
    {
        text: 'Ingliz tilini 21 kunda b2 darajaga chikish',
        percent: 30
    },
    {
        text: 'Matemarika va Algebra ',
        percent: 65
    },
    {
        text: 'Ona tili va Adabiyot ',
        percent: 100
    }
]

const weeks = [
    {
        text: 'Du',
        active: false
    },
    {
        text: 'Se',
        active: false
    },
    {
        text: 'Cho',
        active: true
    },
    {
        text: 'Pa',
        active: true
    }, {
        text: 'Ju',
        active: false
    }, {
        text: 'Sh',
        active: false
    }, {
        text: 'Ya',
        active: false
    },


]

function MainPageBar() {
    return (
        <>
            <h1 className={'text-3xl'}>Salom Ustoz!</h1>
            <p className={'text-sm text-gray-300'}>Yangiliklarni koshish va o’quvchilarizi tekshiring</p>
            <div className={'flex justify-end'}>
                <EditIcon height={22} width={22}/>
            </div>
            <div>
                {
                    bar.map((item, index) =>
                        <div className={'mb-4'} key={index}>
                            <p className={'text-sm mb-2'}>{item.text}</p>
                            <div
                                className="w-full relative bg-transparent border border-gray-100 rounded-full h-[10px]">
                                <div
                                    className={`bg-blue-600 h-[10px]  ${item.percent === 100 ? 'rounded-full' : "rounded-l-lg "}`}
                                    style={{
                                        width: `${item.percent}%`
                                    }}
                                >
                                </div>
                                <p className={`text-center absolute top-0 left-1/2 text-[9px] leading-[10px] m-0 p-0 ${item.percent > 50 ? "text-white" : "text-blue-600"}  `}>30%</p>
                            </div>
                        </div>)
                }

            </div>
            <hr/>
            <div className={'mt-8'}>
                <p className={'text-sm text-blue-200'}>Haftalik faoliyatingiz</p>
                <div className={'flex items-center justify-between'}>
                    <p className={'text-xs text-blue-200 w-3/4'}>7 kunlik maqsadingizga erishish yo'lida. Unda davom
                        eting !</p>
                    <EditIcon height={22} width={22}/>
                </div>
                <div className={'flex w-[90%] items-center justify-between mt-4'}>
                    {
                        weeks.map((item, index) =>
                            <div key={index}
                                 className={`w-[36px] h-[36px] flex justify-center items-center 
                                border border-blue-300 rounded-md ${item.active ? "bg-blue-100" : 'bg-transparent'}`}>
                                {
                                    item.active ?
                                        <CheckLineIcon className={'text-blue-600'} height={14} width={14}/>
                                        : <p className={'text-sm text-blue-300'}>{item.text}</p>
                                }
                            </div>)
                    }
                </div>
                <p className={'text-xs text-blue-200 w-3/4'}> 13 ta bajarilgan ish · 73 daqiqa o'rganildi</p>
            </div>
        </>
    );
}

export default MainPageBar;