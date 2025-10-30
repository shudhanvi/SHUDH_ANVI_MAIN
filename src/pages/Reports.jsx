import React, { useState, useEffect } from "react";
import IconsData from "../data/iconsdata";
import { RobotReportsComponent } from "../components/reports/robotReportsComponent";
import { ManholeReportsComponent } from "../components/reports/manholeReportsComponent";
import { WardReportsComponent } from "../components/reports/wardReportsComponent";
import { useServerData } from "../context/ServerDataContext";

export const Reports = () => {
  const { serverData, loading: serverLoading, message } = useServerData(); // server data
  const [csvData, setCsvData] = useState([]); // local CSV data
  const [mergedData, setMergedData] = useState([]); // combined data

  const [cities, setCities] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [sections, setSections] = useState([]);

  const [userInputs, setUserInputs] = useState({ city: "", division: "", section: "" });
  const [confirmedInputs, setConfirmedInputs] = useState({ city: "", division: "", section: "" });
  const [errors, setErrors] = useState({});
  const [viewClicked, setViewClicked] = useState(false);
  const [activeReportType, setActiveReportType] = useState("Manhole Reports");

  // ✅ Fetch CSV data
  useEffect(() => {
    const fetchCsv = async () => {
      try {
        const response = await fetch("/datafiles/CSVs/ManHoles_Data.csv");
        if (!response.ok) throw new Error("Failed to fetch CSV");
        const text = await response.text();
        const rows = text.trim().split("\n").filter(Boolean);
        const headers = rows[0].split(",").map((h) => h.trim());
        const data = rows.slice(1).map((row) => {
          const values = row.split(",").map((v) => v.trim());
          return headers.reduce((obj, header, i) => {
            obj[header] = values[i] || "";
            return obj;
          }, {});
        });
        setCsvData(data);
      } catch (err) {
        console.error("CSV load failed:", err);
      }
    };
    fetchCsv();
  }, []);

  // ✅ Merge CSV and Server Data
 // ✅ Merge CSV and Server Data
useEffect(() => {
  if (csvData.length > 0 || serverData.length > 0) {
    // Normalize keys from server data to match CSV
    const normalizedServerData = serverData.map((item) => ({
      ...item,
      City: item.City || item.district || "",
      Division: item.Division || item.division || "",
      Section: item.Section || item.area || "",
    }));

    const merged = [...csvData, ...normalizedServerData];
    setMergedData(merged);

    const cityList = [...new Set(merged.map((i) => i.City).filter(Boolean))];
    setCities(cityList);

    console.log("✅ Normalized + Merged Data:", merged);
  }
}, [csvData, serverData]);

  // ✅ Update Divisions when City changes
  useEffect(() => {
    if (userInputs?.city) {
      const divs = [
        ...new Set(
          mergedData
            .filter((r) => r.City === userInputs.city)
            .map((r) => r.Division)
            .filter(Boolean)
        ),
      ];
      setDivisions(divs);
    } else {
      setDivisions([]);
      setSections([]);
    }
  }, [userInputs.city, mergedData]);

  // ✅ Update Sections when Division changes
  useEffect(() => {
    if (userInputs.division) {
      const secs = [
        ...new Set(
          mergedData
            .filter(
              (r) =>
                r.City === userInputs.city && r.Division === userInputs.division
            )
            .map((r) => r.Section)
            .filter(Boolean)
        ),
      ];
      setSections(secs);
    } else {
      setSections([]);
    }
  }, [userInputs.division, userInputs.city, mergedData]);

  // ✅ Handle Dropdown Change
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
    if (value) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ✅ Validate before showing reports
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
        {/* Loading state */}
        {serverLoading ? (
          <div className="text-center py-10 text-gray-600">{message}</div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-end gap-6 p-6 border-[1.5px] border-[#E1E7EF] rounded-lg bg-white">
              {/* City */}
              <div className="flex-1 min-w-[250px] relative flex flex-col">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    value={userInputs.city}
                    onChange={(e) => handleInput("city", e.target.value)}
                    className="w-full h-10 px-3 border rounded-md border-gray-300"
                  >
                    <option value="">Select City</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.city && (
                  <p className="text-red-500 text-xs absolute bottom-[-18px]">{errors.city}</p>
                )}
              </div>

              {/* Division */}
              <div className="flex-1 min-w-[250px] relative flex flex-col">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Division</label>
                  <select
                    value={userInputs.division}
                    onChange={(e) => handleInput("division", e.target.value)}
                    disabled={!userInputs.city}
                    className="w-full h-10 px-3 border rounded-md border-gray-300 disabled:bg-gray-100"
                  >
                    <option value="">Select Division</option>
                    {divisions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.division && (
                  <p className="text-red-500 text-xs absolute bottom-[-18px]">{errors.division}</p>
                )}
              </div>

              {/* Section */}
              <div className="flex-1 min-w-[250px] relative flex flex-col">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <select
                    value={userInputs.section}
                    onChange={(e) => handleInput("section", e.target.value)}
                    disabled={!userInputs.division}
                    className="w-full h-10 px-3 border rounded-md border-gray-300 disabled:bg-gray-100"
                  >
                    <option value="">Select Section</option>
                    {sections.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.section && (
                  <p className="text-red-500 text-xs absolute bottom-[-18px]">{errors.section}</p>
                )}
              </div>

              <button
                onClick={handleViewReports}
                className="px-[20px] py-[10px] text-white flex items-center gap-[4px] bg-[#1E9AB0] rounded-[12px] hover:bg-[#157a8c] transition-all"
              >
                <span>{IconsData.search}</span>View Reports
              </button>
            </div>

            {/* Reports display */}
            {!viewClicked ? (
              <div className="text-center py-10 px-6">
                <img
                  src="/images/Report.png"
                  alt="Report Placeholder"
                  className="mx-auto h-48 w-48 object-contain"
                />
                <p className="mt-4 text-[#65758B]">
                  No reports to display yet. Please select a Division and Section to generate reports.
                </p>
              </div>
            ) : (
              <div className="mt-6">
                {/* Tabs */}
                <div className="flex gap-2">
                  {["Manhole Reports", "Robot Reports", "Ward Reports"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setActiveReportType(type)}
                      className={`px-[16px] py-[12px] text-sm rounded-[8px] font-medium border transition-colors ${
                        activeReportType === type
                          ? "bg-[#1A8BA8] text-white"
                          : "border-[#1A8BA8]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {/* Report Components */}
                <div className="mt-4">
                  {activeReportType === "Manhole Reports" && (
                    <ManholeReportsComponent
                      city={confirmedInputs.city}
                      division={confirmedInputs.division}
                      section={confirmedInputs.section}
                    />
                  )}
                  {activeReportType === "Robot Reports" && (
                    <RobotReportsComponent
                      city={confirmedInputs.city}
                      division={confirmedInputs.division}
                      section={confirmedInputs.section}
                    />
                  )}
                  {activeReportType === "Ward Reports" && (
                    <WardReportsComponent
                      city={confirmedInputs.city}
                      division={confirmedInputs.division}
                      section={confirmedInputs.section}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </section>
  );
};
