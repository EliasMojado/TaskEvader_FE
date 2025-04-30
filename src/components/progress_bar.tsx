import {Tooltip} from "react-tooltip";

export type ProgressProps = {
    progress: { completed: number; ongoing: number; missed: number }
}

export const ProgressBar = ({progress}: ProgressProps) => {
    const total_subtasks: number = progress.completed + progress.ongoing + progress.missed;
    return <div className="h-full">
        <div className="flex flex-row h-full w-full max-w-md rounded-full overflow-hidden border border-black">
            <div
                data-tooltip-id={'finished_tooltip'}
                data-tooltip-content={`${progress.completed}/${total_subtasks} Finished`}
                data-tooltip-delay-show={200}
                data-tooltip-delay-hide={200}
                data-tooltip-place={"bottom"}
                data-tooltip-class-name="text-red"
                className="bg-carribean-current h-full cursor-pointer hover:shadow-lg"
                style={{
                    width: `${(progress.completed / total_subtasks) * 100}%`
                }}
                onClick={(e) => {
                    e.stopPropagation();
                }}
            />

            <div
                data-tooltip-id={'ongoing_tooltip'}
                data-tooltip-content={`${progress.ongoing}/${total_subtasks} In Progress`}
                data-tooltip-delay-show={200}
                data-tooltip-delay-hide={200}
                data-tooltip-place={"bottom"}
                data-tooltip-class-name="text-red"
                className="bg-icterine h-full cursor-pointer"
                style={{
                    width: `${(progress.ongoing / total_subtasks) * 100}%`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
            />

            <div
                data-tooltip-id={'missed_tooltip'}
                data-tooltip-content={`${progress.missed}/${total_subtasks} Missed`}
                data-tooltip-delay-show={200}
                data-tooltip-delay-hide={200}
                data-tooltip-place={"bottom"}
                data-tooltip-class-name="text-red"
                className="bg-pastel-red h-full cursor-pointer"
                style={{
                    width: `${(progress.missed / total_subtasks) * 100}%`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
            />
        </div>
        <Tooltip
            id="finished_tooltip"
            style={{
                backgroundColor: "white",
                color: "#197278",
                padding: "8px 12px",
                borderRadius: "6px",
                fontWeight: "bold",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
                zIndex: 10
            }}
        />
        <Tooltip
            id="ongoing_tooltip"
            style={{
                backgroundColor: "#197278",
                color: "#F9F94D",
                padding: "8px 12px",
                borderRadius: "6px",
                fontWeight: "bold",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
                zIndex: 10
            }}
        />
        <Tooltip
            id="missed_tooltip"
            style={{
                backgroundColor: "white",
                color: "#FC7554",
                padding: "8px 12px",
                borderRadius: "6px",
                fontWeight: "bold",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
                zIndex: 10
            }}
        />
    </div>
}