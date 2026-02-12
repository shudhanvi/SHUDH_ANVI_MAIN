

import React, { useState, useEffect } from "react";
import IconsData from "../data/iconsdata";
import { RobotReportsComponent } from "../components/reports/robotReportsComponent";
import { ManholeReportsComponent } from "../components/reports/manholeReportsComponent";
import { WardReportsComponent } from "../components/reports/wardReportsComponent";
import { useServerData } from "../context/ServerDataContext";

export const Reports = () => {
  const { data, loading, message } = useServerData();

  // ✅ ONLY dropdown data
  const dropdownData = data?.dropdowndata || [];

  const [cities, setCities] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [sections, setSections] = useState([]);

  const [userInputs, setUserInputs] = useState({
    city: "",
    division: "",
    section: "",
  });

  const [confirmedInputs, setConfirmedInputs] = useState({
    city: "",
    division: "",
    section: "",
  });

  const [errors, setErrors] = useState({});
  const [viewClicked, setViewClicked] = useState(false);
  const [activeReportType, setActiveReportType] =
    useState("Manhole Reports");

  /**
   * Display cleaner names if needed (kept as-is)
   */
  const getDisplayName = (rawName) => {
    if (typeof rawName !== "string") return rawName;

    const match = rawName.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      const textInside = match[1];
      if (/[a-zA-Z]/.test(textInside)) {
        return textInside.trim();
      } else {
        return rawName.split("(")[0].trim();
      }
    }
    return rawName.trim();
  };

  // ✅ Cities from Dropdowndata
  useEffect(() => {
    if (!dropdownData.length) return;

    const cityList = [
      ...new Set(
        dropdownData.map((d) => d.district).filter(Boolean)
      ),
    ];
    setCities(cityList);
  }, [dropdownData]);

  // ✅ Divisions based on City
  useEffect(() => {
    if (!userInputs.city) {
      setDivisions([]);
      setSections([]);
      return;
    }

    const divs = [
      ...new Set(
        dropdownData
          .filter((d) => d.district === userInputs.city)
          .map((d) => d.division)
          .filter(Boolean)
      ),
    ];

    setDivisions(divs);
  }, [userInputs.city, dropdownData]);

  // ✅ Sections based on Division
  useEffect(() => {
    if (!userInputs.division) {
      setSections([]);
      return;
    }

    const secs = [
      ...new Set(
        dropdownData
          .filter(
            (d) =>
              d.district === userInputs.city &&
              d.division === userInputs.division
          )
          .map((d) => d.section)
          .filter(Boolean)
      ),
    ];

    setSections(secs);
  }, [userInputs.division, userInputs.city, dropdownData]);

  // ✅ Handle Input
  const handleInput = (field, value) => {
    setUserInputs((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "city") {
        updated.division = "";
        updated.section = "";
      } else if (field === "division") {
        updated.section = "";
      }
      return updated;
    });

    if (value) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // ✅ Validation
  const validate = () => {
    const newErrors = {};
    if (!userInputs.city) newErrors.city = "*City is required";
    if (!userInputs.division) newErrors.division = "*Division is required";
    if (!userInputs.section) newErrors.section = "*Section is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleViewReports = () => {
    if (validate()) {
      setConfirmedInputs({ ...userInputs });
      setViewClicked(true);
    }
  };

  return (
    <section className="w-full">
      {/* Header */}
      <section className="border-b-[1.5px] border-[#E1E7EF] py-[10px] px-[30px] bg-white">
        <h1 className="text-[24px] font-bold">Reports</h1>
        <p className="text-[14px] text-[#65758B]">
          Generate and manage system reports and data exports
        </p>
      </section>

      <section className="w-full p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-6 p-6 border-[1.5px] border-[#E1E7EF] rounded-lg bg-white">
          {/* City */}
          <div className="flex-1 min-w-[250px] relative flex flex-col">
            <label className="text-sm font-medium mb-1">City</label>
            <select
              value={userInputs.city}
              onChange={(e) =>
                handleInput("city", e.target.value)
              }
              className="w-full h-10 px-3 border rounded-md"
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-red-500 text-xs absolute -bottom-5">
                {errors.city}
              </p>
            )}
          </div>

          {/* Division */}
          <div className="flex-1 min-w-[250px] relative flex flex-col">
            <label className="text-sm font-medium mb-1">
              Division
            </label>
            <select
              value={userInputs.division}
              onChange={(e) =>
                handleInput("division", e.target.value)
              }
              className="w-full h-10 px-3 border rounded-md"
            >
              <option value="">Select Division</option>
              {divisions.map((d) => (
                <option key={d} value={d}>
                  {getDisplayName(d)}
                </option>
              ))}
            </select>
            {errors.division && (
              <p className="text-red-500 text-xs absolute -bottom-5">
                {errors.division}
              </p>
            )}
          </div>

          {/* Section */}
          <div className="flex-1 min-w-[250px] relative flex flex-col">
            <label className="text-sm font-medium mb-1">
              Section
            </label>
            <select
              value={userInputs.section}
              onChange={(e) =>
                handleInput("section", e.target.value)
              }
              className="w-full h-10 px-3 border rounded-md"
            >
              <option value="">Select Section</option>
              {sections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.section && (
              <p className="text-red-500 text-xs absolute -bottom-5">
                {errors.section}
              </p>
            )}
          </div>

          <button
             onClick={handleViewReports}
             className="px-[20px] py-[10px] text-white flex items-center gap-[4px] bg-[#1E9AB0] rounded-[12px] hover:bg-[#157a8c] transition-all cursor-pointer"
           >
             <span>{IconsData.search}</span>View Reports
           </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-4">
            {message || "Loading..."}
          </div>
        ) : !viewClicked ? (
          <div className="text-center py-10">
            <img
              src="/images/Report.png"
              className="mx-auto h-48"
              alt="Report"
            />
            <p className="mt-4 italic text-[#65758B]">
              "No reports to display yet. Please select filters."
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex gap-2">
              {[
                "Manhole Reports",
                "Robot Reports",
                "Ward Reports",
              ].map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setActiveReportType(type)
                  }
                  className={`px-4 py-3 rounded-lg border ${
                    activeReportType === type
                      ? "bg-[#1A8BA8] text-white"
                      : "border-[#1A8BA8]"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="mt-4">
              {activeReportType ===
                "Manhole Reports" && (
                <ManholeReportsComponent
                  {...confirmedInputs}
                />
              )}
              {activeReportType ===
                "Robot Reports" && (
                <RobotReportsComponent
                  {...confirmedInputs}
                />
              )}
              {activeReportType ===
                "Ward Reports" && (
                <WardReportsComponent
                  {...confirmedInputs}
                />
              )}
            </div>
          </div>
        )}
      </section>
    </section>
  );
};
