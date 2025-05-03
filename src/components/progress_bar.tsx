import {Tooltip} from "react-tooltip";

type ProgressProps = {
  progress: {
    completed: number;
    ongoing: number;
    missed: number;
  };
}

export const ProgressBar = ({ progress }: ProgressProps) => {
  const total_subtasks: number = progress.completed + progress.ongoing + progress.missed;

  return (
      <div className="h-full w-full overflow-hidden">
        <div className="flex flex-row h-full w-full max-w-full rounded-full overflow-hidden border border-black">
          {progress.completed > 0 && (
              <div
                  data-tooltip-id={"finished_tooltip"}
                  data-tooltip-content={`${progress.completed}/${total_subtasks} Finished`}
                  data-tooltip-delay-show={200}
                  data-tooltip-delay-hide={200}
                  data-tooltip-place={"bottom"}
                  className="bg-uranian-blue h-full cursor-pointer hover:shadow-lg border-r border-black"
                  style={{
                    width: `${(progress.completed / total_subtasks) * 100}%`,
                    minWidth: 0, // Prevents overflow
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
              />
          )}

          {progress.ongoing > 0 && (
              <div
                  data-tooltip-id={"ongoing_tooltip"}
                  data-tooltip-content={`${progress.ongoing}/${total_subtasks} In Progress`}
                  data-tooltip-delay-show={200}
                  data-tooltip-delay-hide={200}
                  data-tooltip-place={"bottom"}
                  className="bg-icterine h-full cursor-pointer"
                  style={{
                    width: `${(progress.ongoing / total_subtasks) * 100}%`,
                    minWidth: 0, // Prevents overflow
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
              />
          )}

          {progress.missed > 0 && (
              <div
                  data-tooltip-id={"missed_tooltip"}
                  data-tooltip-content={`${progress.missed}/${total_subtasks} Missed`}
                  data-tooltip-delay-show={200}
                  data-tooltip-delay-hide={200}
                  data-tooltip-place={"bottom"}
                  className="bg-pastel-red h-full cursor-pointer"
                  style={{
                    width: `${(progress.missed / total_subtasks) * 100}%`,
                    minWidth: 0, // Prevents overflow
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
              />
          )}
        </div>
        <Tooltip
            id="finished_tooltip"
            style={{
                backgroundColor: "#B4D3F9",
                color: "#001F54",
                padding: "8px 10px",
                borderRadius: "6px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                fontSize: "10px",
                zIndex: 10
            }}
        />
        <Tooltip
            id="ongoing_tooltip"
            opacity={0.8}
            style={{
                backgroundColor: "#FDFF83",
                color: "#001F54",
                padding: "8px 10px",
                borderRadius: "6px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                fontSize: "10px",
                zIndex: 10,

                backdropFilter: "blur(30px)",
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
    );
}