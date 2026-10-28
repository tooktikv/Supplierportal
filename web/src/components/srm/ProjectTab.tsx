"use client";

import { useState } from "react";
import { Badge } from "@/components/ui";
import { todayIso } from "@/lib/docs";
import { usePortal } from "@/lib/store";
import { useConfirm } from "@/components/ConfirmDialog";
import DemoFill from "@/components/DemoFill";
import { fillDemoProject } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { addTwoYears, dmy, emptyProject, my, PROJECT_TYPES, projectErrors, SOURCING_OWNERS, type SrmProject } from "@/lib/srm";
import { Footer, Input, Radios, Section, Upload } from "./fields";

const PROGRESS = ["Not Start", "In progress", "Implement"];

export default function ProjectTab() {
  const { db, mutate, toast } = usePortal();
  const { t } = useI18n();
  const confirm = useConfirm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const projects = db.srm.projects;
  const project = projects.find((item) => item.id === editingId);

  const update = (change: (value: SrmProject) => void) => {
    setErrors({});
    mutate((d) => {
      const current = d.srm.projects.find((item) => item.id === editingId);
      if (!current) return;
      change(current);
      current.status = "Draft";
      current.updated = todayIso();
    });
  };

  const add = () => {
    const created = emptyProject();
    mutate((d) => void d.srm.projects.unshift(created));
    setErrors({});
    setEditingId(created.id);
  };

  const remove = async (item: SrmProject) => {
    if (!(await confirm({ title: "Delete project", message: "Delete project \"{name}\"?", vars: { name: item.name || t("Untitled project") }, confirmLabel: "Delete", tone: "danger" }))) return;
    mutate((d) => void (d.srm.projects = d.srm.projects.filter((entry) => entry.id !== item.id)));
    toast("Project deleted.");
  };

  const submit = async () => {
    if (!project) return;
    const next = projectErrors(project);
    setErrors(next);
    if (Object.keys(next).length) return toast("Complete the highlighted fields before submitting.");
    if (!(await confirm({ message: "Submit this project?", confirmLabel: "Submit" }))) return;
    mutate((d) => {
      const current = d.srm.projects.find((item) => item.id === project.id);
      if (current) Object.assign(current, { status: "Submitted", updated: todayIso() });
    });
    toast("Project submitted.");
    setEditingId(null);
  };

  if (!project) {
    return (
      <div className="card table-card">
        <div className="srm-toolbar">
          <div><h2>{t("Projects")}</h2><small>{t("Innovation and sustainability projects with their benefit and progress.")}</small></div>
          <button className="button primary" onClick={add}>{t("+ Add project")}</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>{["Project", "Type", "Sourcing owner", "Benefit", "Period", "Progress", "Updated", "Status", "Actions"].map((heading) => <th key={heading}>{t(heading)}</th>)}</tr></thead>
            <tbody>
              {projects.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.name || t("Untitled project")}</strong><small>{item.projectType ? t(item.projectType) : ""}</small></td>
                  <td>{item.selectType ? t(item.selectType) : "—"}</td>
                  <td>{item.owner || "—"}</td>
                  <td>{item.benefit ? `${item.benefit} ${item.indicator}` : "—"}</td>
                  <td>{dmy(item.startDate)} → {dmy(item.endDate)}</td>
                  <td>{item.progress ? t(item.progress) : "—"}<small>{t("Update {month}", { month: my(item.updateMonth) })}</small></td>
                  <td>{dmy(item.updated)}</td>
                  <td><Badge status={item.status} /></td>
                  <td>
                    <div className="row-actions">
                      <button className="button small" onClick={() => { setErrors({}); setEditingId(item.id); }}>{t("Edit")}</button>
                      <button className="button small subtle danger" onClick={() => remove(item)}>{t("Delete")}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {projects.length === 0 && <div className="table-empty"><h3>{t("No projects yet")}</h3><p>{t("Add a project to report its benefit and progress.")}</p><button className="button" onClick={add}>{t("+ Add project")}</button></div>}
        </div>
      </div>
    );
  }

  const field = (key: "name" | "objective" | "benefit" | "startDate" | "endDate" | "updateMonth" | "details") => ({
    name: `project-${key}`, value: project[key], error: errors[key],
    onChange: (value: string) => update((draft) => {
      draft[key] = value;
      if (key === "startDate" && !draft.endEdited) draft.endDate = addTwoYears(value);
      if (key === "endDate") draft.endEdited = true;
    }),
  });

  return (
    <div className="reg-main">
      <DemoFill onFill={() => update(fillDemoProject)} />
      <Section num={1} title="Project information" hint="Changes are saved automatically as a draft until you submit." extra={<Badge status={project.status} />}>
        <Radios name="project-selectType" label="Select Type" options={["Innovation", "Sustainability"] as const} value={project.selectType} required error={errors.selectType}
          onChange={(value) => update((draft) => { draft.selectType = value; draft.projectType = ""; })} />
        <Input {...field("name")} label="ชื่อโครงการ" span={4} required hint="Max 255 characters" />
        <Input name="project-projectType" label="Project Type" type="select" options={PROJECT_TYPES[project.selectType] || []} value={project.projectType} required error={errors.projectType}
          placeholder={project.selectType ? "Choose a project type" : "Select a type first"} onChange={(value) => update((draft) => void (draft.projectType = value))} />
        <Input name="project-owner" label="Sourcing Owner" type="select" options={SOURCING_OWNERS} value={project.owner} required error={errors.owner} placeholder="Choose a sourcing owner"
          onChange={(value) => update((draft) => void (draft.owner = value))} />
        <Input {...field("objective")} label="Objective & Description" type="textarea" hint="Optional · max 5000 characters" />
        <Input {...field("benefit")} label="Benefit" span={1} required placeholder="e.g. 12.50 or -3.25" />
        <Input name="project-indicator" label="Indicator" type="select" options={["%", "MB"]} value={project.indicator} span={1} required error={errors.indicator} placeholder="Choose"
          onChange={(value) => update((draft) => void (draft.indicator = value as SrmProject["indicator"]))} />
        <Input {...field("startDate")} label="Start Date" type="date" span={1} required />
        <Input {...field("endDate")} label="End Date" type="date" span={1} required />
        <Upload name="files" label="Attach file" files={project.files} max={3} required error={errors.files} hint="PDF · at least 1, up to 3 files · max 5 MB per file" onChange={(files) => update((draft) => void (draft.files = files))} />
      </Section>
      <Section num={2} title="Progress update" hint="Progress affects the SRM score calculation.">
        <Input {...field("updateMonth")} label="Update Month" type="month" required />
        <Input name="project-progress" label="Progress" type="select" options={PROGRESS} value={project.progress} required error={errors.progress} placeholder="Choose progress"
          onChange={(value) => update((draft) => void (draft.progress = value as SrmProject["progress"]))} />
        <Upload name="progressFiles" label="Attach file" files={project.progressFiles} max={3} onChange={(files) => update((draft) => void (draft.progressFiles = files))} />
        <Input {...field("details")} label="Details" type="textarea" hint="Optional · max 5000 characters" />
      </Section>
      <Footer note={t("End date is prefilled as start date + 2 years and can be edited.")}>
        <button className="button" onClick={() => setEditingId(null)}>{t("Back to projects")}</button>
        <button className="button primary" onClick={submit}>{t("Submit project")}</button>
      </Footer>
    </div>
  );
}
