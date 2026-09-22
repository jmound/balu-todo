import type { Theme } from "@balu/domain";
import type { Snapshot } from "@balu/sync-client";
import { useT } from "../lib/useT.js";
import { useApp } from "../store/app.js";
import { api, getSync } from "../lib/clients.js";
import { canWrite, useMyRole } from "../lib/role.js";
import { syncLabelKey } from "../components/SyncIndicator.js";
import { SyncIndicator } from "../components/SyncIndicator.js";
import { IconButton } from "../components/IconButton.js";
import { Icon } from "../components/Icon.js";
import { ProgressRing } from "../components/ProgressRing.js";
import type { TranslationKey } from "../i18n/index.js";

const THEME_CYCLE: Theme[] = ["system", "light", "dark"];
const THEME_ICON: Record<Theme, string> = { system: "monitor", light: "sun", dark: "moon" };

export function Toolbar({ snapshot }: { snapshot: Snapshot }) {
  const { t } = useT();
  const view = useApp((s) => s.view);
  const theme = useApp((s) => s.theme);
  const setTheme = useApp((s) => s.setTheme);
  const setView = useApp((s) => s.setView);
  const setPalette = useApp((s) => s.setPalette);
  const toggleSidebar = useApp((s) => s.toggleSidebar);
  const setQuickAdd = useApp((s) => s.setQuickAdd);

  const writable = canWrite(useMyRole());

  let title = "Balu";
  let progress: { value: number; total: number } | null = null;

  if (view.kind === "list") title = t(`nav.${view.list}` as TranslationKey);
  else if (view.kind === "settings") title = t("settings.title");
  else if (view.kind === "project") {
    const project = snapshot.projects.find((p) => p.id === view.projectId);
    title = project?.name ?? "Balu";
    const inProject = snapshot.tasks.filter((tk) => !tk.is_deleted && tk.project_id === view.projectId && tk.parent_task_id == null);
    const done = inProject.filter((tk) => tk.completed_at != null).length;
    if (inProject.length > 0) progress = { value: done, total: inProject.length };
  }

  function cycleTheme() {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length]!;
    setTheme(next);
    void api.patchMe({ theme: next }).catch(() => {});
  }

  return (
    <header className="balu-toolbar">
      <IconButton
        className="balu-mobile-menu-btn"
        icon="menu"
        label={t("nav.menu")}
        onClick={toggleSidebar}
      />
      <h1 className="balu-toolbar-title">
        {title}
      </h1>
      {progress && <ProgressRing value={progress.value} total={progress.total} showLabel />}
      {view.kind === "project" && writable && (
        <IconButton
          icon="trash-2"
          label={t("project.deleteProject")}
          onClick={() => {
            if (globalThis.confirm(t("project.deleteProjectConfirm"))) {
              getSync()?.mutate({ type: "project_delete", args: { id: view.projectId } });
              setView({ kind: "list", list: "today" });
            }
          }}
        />
      )}
      <div style={{ flex: 1 }} />
      <button
        type="button"
        className="balu-toolbar-search"
        onClick={() => setPalette(true)}
        title={t("toolbar.search")}
        aria-label={t("toolbar.search")}
      >
        <Icon name="search" size={16} color="var(--text-tertiary)" />
        <span className="balu-toolbar-search-text" style={{ flex: 1, textAlign: "left" }}>{t("toolbar.search")}</span>
        <span className="balu-toolbar-search-shortcut" style={{ fontSize: 12 }}>⌘K</span>
      </button>
      {writable && (
        <IconButton
          className="balu-mobile-quickadd-btn"
          icon="plus"
          label={t("quickadd.add")}
          onClick={() => setQuickAdd(true)}
        />
      )}
      <SyncIndicator state={snapshot.status} label={t(syncLabelKey(snapshot.status) as TranslationKey)} />
      <IconButton icon={THEME_ICON[theme]} label={t("settings.theme")} onClick={cycleTheme} />
      <IconButton
        icon="settings"
        label={t("settings.title")}
        active={view.kind === "settings"}
        onClick={() => setView({ kind: "settings" })}
      />
    </header>
  );
}
