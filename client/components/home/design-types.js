import {designTypes} from "@/config"
function DesignTypes(){
    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6 mt-12 justify-center">
            {
                designTypes.map((type,index)=>(
                    <div key={index} className={`flex flex-col items-center justify-center`}>
                        <div className={`${type.bgColor} w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-md hover:shadow-lg transition-shadow cursor-pointer`}>
                            {type.icon}
                        </div>
                        <span className="text-xs text-center font-medium w-full px-1 line-clamp-2">{type.label}</span>
                    </div>
                ))
            }
        </div>
    )
}

export default DesignTypes