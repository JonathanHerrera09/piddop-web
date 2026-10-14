import { FormEvent, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PaginationControls } from '@/components/PaginationControls';
import {
  createAdminCompanyTeamMember,
  getAdminCompanyRoles,
  getAdminCompanyTeam,
  removeAdminCompanyTeamMember,
  updateAdminCompanyTeamMember,
  updateAdminCompanyTeamRoles,
  type CompanyAssignableRole,
  type CompanyTeamMember,
  type PaginationMeta
} from '@/services/dashboard.service';
import type { CompanySummary } from '@/types/dashboard';

interface Props {
  accessToken: string;
  company: CompanySummary;
  onClose?: () => void;
}

type IconName = 'arrow-left' | 'briefcase' | 'building' | 'check' | 'chevron' | 'edit' | 'eye' | 'eye-off' | 'lock' | 'mail' | 'phone' | 'plus' | 'search' | 'trash' | 'user' | 'users';
const emptyForm = { name: '', last_name: '', email: '', phone: '', password: '', role_id: 0, status: 'active' };

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    'arrow-left': <><path d="m15 18-6-6 6-6" /><path d="M9 12h10" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    building: <><path d="M4 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M16 8h3a1 1 0 0 1 1 1v12M8 7h4M8 11h4M8 15h4M3 21h18" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    edit: <><path d="M12 20h9M4 16l-1 5 5-1L19 9l-4-4L4 16Z" /><path d="m13 7 4 4" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    'eye-off': <><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.7 10.7 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.1 3.1M6.6 6.6C3.6 8.4 2 12 2 12s3.5 8 10 8a9.8 9.8 0 0 0 4-.8" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>
  };
  return <svg className="admin-user-icon" aria-hidden="true" viewBox="0 0 24 24">{paths[name]}</svg>;
}

function roleLabel(name: string) {
  return ({ OWNER: 'Propietario', MANAGER: 'Administrador', COOK: 'Cocina', PROFESSIONAL: 'Profesional', CATALOG_MANAGER: 'Gestor de catálogo', SUPPORT: 'Soporte' } as Record<string, string>)[name] || name;
}

function initials(member: CompanyTeamMember) {
  return `${member.user?.name?.[0] || ''}${member.user?.last_name?.[0] || ''}`.toUpperCase() || 'U';
}

export function AdminCompanyTeamPanel({ accessToken, company, onClose }: Props) {
  const [members, setMembers] = useState<CompanyTeamMember[]>([]);
  const [roles, setRoles] = useState<CompanyAssignableRole[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CompanyTeamMember | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmMember, setConfirmMember] = useState<CompanyTeamMember | null>(null);

  const ownerRole = useMemo(() => roles.find((role) => role.name === 'OWNER'), [roles]);
  const totalMembers = pagination?.total_items ?? members.length;
  const visibleManagers = members.filter((member) => ['OWNER', 'MANAGER'].includes(member.companyRoles?.[0]?.name || '')).length;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [team, availableRoles] = await Promise.all([
        getAdminCompanyTeam(accessToken, company.id, { page, page_size: pageSize, search: appliedSearch }),
        getAdminCompanyRoles(accessToken, company.id)
      ]);
      setMembers(team);
      setPagination(team.pagination);
      setRoles(availableRoles);
      setForm((current) => current.role_id ? current : {
        ...current,
        role_id: availableRoles.find((role) => role.name === 'OWNER')?.id || availableRoles[0]?.id || 0
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos cargar los usuarios de la empresa.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, appliedSearch, company.id, page, pageSize]);

  useEffect(() => { void load(); }, [load]);

  function closeForm() {
    setForm({ ...emptyForm, role_id: ownerRole?.id || roles[0]?.id || 0 });
    setShowPassword(false);
    setError(null);
    setFormOpen(false);
    setEditingMember(null);
  }

  function openEdit(member: CompanyTeamMember) {
    if (!member.user) return;
    setForm({ name: member.user.name, last_name: member.user.last_name, email: member.user.email, phone: member.user.phone || '', password: '', role_id: member.companyRoles?.[0]?.id || 0, status: member.user.status });
    setEditingMember(member);
    setShowPassword(false);
    setError(null);
    setFormOpen(true);
  }

  async function createMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.last_name.trim() || !form.email.trim() || !form.phone.trim() || (!editingMember && form.password.length < 8) || (editingMember && form.password.length > 0 && form.password.length < 8) || !form.role_id) {
      setError('Completa todos los campos. La contraseña debe tener mínimo 8 caracteres.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      if (editingMember) {
        await updateAdminCompanyTeamMember(accessToken, company.id, editingMember.id, {
          name: form.name.trim(), last_name: form.last_name.trim(), email: form.email.trim(),
          phone: form.phone.trim(), status: form.status, role_ids: [form.role_id], ...(form.password ? { password: form.password } : {})
        });
      } else {
        await createAdminCompanyTeamMember(accessToken, company.id, {
          name: form.name.trim(), last_name: form.last_name.trim(), email: form.email.trim(),
          phone: form.phone.trim(), password: form.password, role_ids: [form.role_id]
        });
      }
      closeForm();
      if (page !== 1) setPage(1); else await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos guardar el usuario.');
    } finally {
      setPending(false);
    }
  }

  async function changeRole(member: CompanyTeamMember, roleId: number) {
    setPending(true);
    setError(null);
    try {
      await updateAdminCompanyTeamRoles(accessToken, company.id, member.id, [roleId]);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos actualizar el rol.');
    } finally {
      setPending(false);
    }
  }

  async function removeMember() {
    if (!confirmMember) return;
    setPending(true);
    setError(null);
    try {
      await removeAdminCompanyTeamMember(accessToken, company.id, confirmMember.id);
      setConfirmMember(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos retirar el usuario.');
    } finally {
      setPending(false);
    }
  }

  if (formOpen) {
    return (
      <section className="admin-user-create" aria-labelledby="new-company-user-title">
        <header className="admin-user-create__header">
          <button className="admin-user-back" onClick={closeForm} type="button"><Icon name="arrow-left" />Volver al equipo</button>
          <div className="admin-user-create__heading">
            <span className="admin-user-create__mark"><Icon name="user" /></span>
            <div><p className="dashboard-header__eyebrow">{editingMember ? 'Editar acceso' : 'Nuevo acceso'}</p><h2 id="new-company-user-title">{editingMember ? 'Editar usuario de empresa' : 'Crear usuario de empresa'}</h2><p>Configura una cuenta para que pueda ingresar y trabajar en <strong>{company.name}</strong>.</p></div>
          </div>
        </header>

        <form className="admin-user-form" onSubmit={(event) => void createMember(event)}>
          <FormSection number="1" title="Información personal" help="Datos de la persona responsable de esta cuenta.">
            <UserField id="company-user-name" label="Nombre" icon="user"><input id="company-user-name" autoFocus autoComplete="given-name" placeholder="Ej. Laura" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></UserField>
            <UserField id="company-user-last-name" label="Apellido" icon="user"><input id="company-user-last-name" autoComplete="family-name" placeholder="Ej. Gómez" value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} /></UserField>
            <UserField id="company-user-email" label="Correo electrónico" icon="mail"><input id="company-user-email" autoComplete="email" type="email" placeholder="nombre@empresa.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></UserField>
            <UserField id="company-user-phone" label="Teléfono" icon="phone"><input id="company-user-phone" autoComplete="tel" inputMode="tel" placeholder="Ej. 300 123 4567" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></UserField>
          </FormSection>

          <FormSection number="2" title="Acceso y permisos" help="Define cómo ingresará y qué función tendrá.">
            <div className="admin-user-field"><label htmlFor="company-user-password">{editingMember ? 'Nueva contraseña (opcional)' : 'Contraseña temporal'}</label><div className="admin-user-field__control admin-user-field__control--password"><Icon name="lock" /><input id="company-user-password" autoComplete="new-password" minLength={8} placeholder={editingMember ? 'Dejar vacío para conservarla' : 'Mínimo 8 caracteres'} type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><button aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="admin-user-password-toggle" onClick={() => setShowPassword((visible) => !visible)} type="button"><Icon name={showPassword ? 'eye-off' : 'eye'} /></button></div><small>{editingMember ? 'Solo se cambiará si escribes una nueva contraseña.' : 'La persona podrá cambiarla después de iniciar sesión.'}</small></div>
            <div className="admin-user-field"><label htmlFor="company-user-role">Rol dentro de la empresa</label><div className="admin-user-field__control admin-user-field__control--select"><Icon name="briefcase" /><select id="company-user-role" value={form.role_id} onChange={(event) => setForm({ ...form, role_id: Number(event.target.value) })}><option value={0}>Selecciona un rol</option>{roles.map((role) => <option key={role.id} value={role.id}>{roleLabel(role.name)}</option>)}</select><Icon name="chevron" /></div><small>El rol determina las secciones y acciones disponibles.</small></div>
            {editingMember ? <div className="admin-user-field"><label htmlFor="company-user-status">Estado de la cuenta</label><div className="admin-user-field__control admin-user-field__control--select"><Icon name="user" /><select id="company-user-status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="active">Activo</option><option value="inactive">Inactivo</option><option value="suspended">Suspendido</option></select><Icon name="chevron" /></div></div> : null}
          </FormSection>

          {error ? <div className="admin-user-form__error" role="alert">{error}</div> : null}
          <footer className="admin-user-form__actions"><button className="secondary-button" onClick={closeForm} type="button">Cancelar</button><button className="primary-button action-with-icon" disabled={pending || !roles.length} type="submit"><Icon name="check" />{pending ? 'Guardando...' : editingMember ? 'Guardar cambios' : 'Crear y vincular'}</button></footer>
        </form>
      </section>
    );
  }

  return (
    <section className="admin-team-panel">
      <header className="admin-team-hero">
        <div className="admin-team-hero__main"><span className="admin-team-hero__icon"><Icon name="users" /></span><div><p className="dashboard-header__eyebrow">Gestión de accesos</p><h2>Equipo de {company.name}</h2><p>Administra las personas que pueden ingresar y operar esta empresa.</p></div></div>
        <div className="admin-team-hero__actions">{onClose ? <button className="secondary-button action-with-icon" onClick={onClose} type="button"><Icon name="arrow-left" />Empresas</button> : null}<button className="primary-button action-with-icon" onClick={() => { setError(null); setFormOpen(true); }} type="button"><Icon name="plus" />Nuevo usuario</button></div>
      </header>

      <div className="admin-team-summary" aria-label="Resumen del equipo">
        <Summary icon="users" value={totalMembers} label="Usuarios vinculados" />
        <Summary icon="briefcase" value={visibleManagers} label="Responsables visibles" />
        <Summary icon="building" value={company.status === 'active' ? 'Activa' : company.status} label="Estado de la empresa" />
      </div>

      <section className="admin-team-directory" aria-labelledby="company-team-list-title">
        <div className="admin-team-directory__header">
          <div><h3 id="company-team-list-title">Usuarios vinculados</h3><p>Busca una persona o edita sus datos y permisos.</p></div>
          <form className="admin-team-search" onSubmit={(event) => { event.preventDefault(); setPage(1); setAppliedSearch(search.trim()); }}><Icon name="search" /><label className="sr-only" htmlFor={`company-user-search-${company.id}`}>Buscar usuario</label><input id={`company-user-search-${company.id}`} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o correo" value={search} /><button type="submit">Buscar</button></form>
        </div>

        {error ? <div className="admin-user-form__error" role="alert">{error}</div> : null}
        {loading ? <div className="admin-team-loading" aria-busy="true" role="status"><div className="workspace-state__spinner" /><p>Cargando usuarios...</p></div> : null}
        {!loading && !members.length ? <div className="admin-team-empty"><span><Icon name="users" /></span><h3>{appliedSearch ? 'No encontramos usuarios' : 'Aún no hay usuarios vinculados'}</h3><p>{appliedSearch ? 'Prueba con otro nombre o correo.' : 'Crea al propietario o administrador que estará a cargo de esta empresa.'}</p>{!appliedSearch ? <button className="primary-button action-with-icon" onClick={() => setFormOpen(true)} type="button"><Icon name="plus" />Crear primer usuario</button> : null}</div> : null}

        {!loading && members.length ? <div className="admin-team-list">{members.map((member) => {
          const currentRole = member.companyRoles?.[0];
          const isOwner = currentRole?.name === 'OWNER';
          return <article className="admin-team-member" key={member.id}>
            <div className="admin-team-member__identity"><span className="admin-team-member__avatar">{initials(member)}</span><div><strong>{member.user?.name} {member.user?.last_name}</strong><p>{member.user?.email}</p><small>{member.user?.phone || 'Sin teléfono registrado'}</small></div></div>
            <span className={`status-badge status-badge--${member.user?.status}`}>{member.user?.status === 'active' ? 'Activo' : member.user?.status}</span>
            <label className="admin-team-member__role"><span>Rol asignado</span><select disabled={pending} value={currentRole?.id || 0} onChange={(event) => void changeRole(member, Number(event.target.value))}><option value={0} disabled>Seleccionar</option>{roles.map((role) => <option key={role.id} value={role.id}>{roleLabel(role.name)}</option>)}</select></label>
            <button className="admin-team-member__edit" disabled={pending} onClick={() => openEdit(member)} type="button"><Icon name="edit" /><span>Editar</span></button>
            <button aria-label={`Retirar a ${member.user?.name || 'usuario'}`} className="admin-team-member__remove" disabled={pending || isOwner} onClick={() => setConfirmMember(member)} title={isOwner ? 'Cambia primero el rol del propietario para poder retirarlo.' : 'Retirar de la empresa'} type="button"><Icon name="trash" /><span>Retirar</span></button>
          </article>;
        })}<PaginationControls pagination={pagination} onPageChange={setPage} onPageSizeChange={(size) => { setPage(1); setPageSize(size); }} /></div> : null}
      </section>
      <ConfirmDialog open={Boolean(confirmMember)} title="Retirar usuario" message={`¿Retirar a ${confirmMember?.user?.name || 'este usuario'} de ${company.name}?`} confirmLabel="Retirar" pending={pending} onCancel={() => !pending && setConfirmMember(null)} onConfirm={() => void removeMember()} />
    </section>
  );
}

function UserField({ id, label, icon, children }: { id: string; label: string; icon: IconName; children: ReactNode }) {
  return <div className="admin-user-field"><label htmlFor={id}>{label}</label><div className="admin-user-field__control"><Icon name={icon} />{children}</div></div>;
}

function FormSection({ number, title, help, children }: { number: string; title: string; help: string; children: ReactNode }) {
  return <section className="admin-user-form__section"><div className="admin-user-form__section-title"><span>{number}</span><div><h3>{title}</h3><p>{help}</p></div></div><div className="admin-user-form__grid">{children}</div></section>;
}

function Summary({ icon, value, label }: { icon: IconName; value: string | number | undefined; label: string }) {
  return <article><span className="admin-team-summary__icon"><Icon name={icon} /></span><div><strong>{value ?? '—'}</strong><small>{label}</small></div></article>;
}

export function AdminCompanyUsersModule({ accessToken, companies }: { accessToken: string; companies: CompanySummary[] }) {
  const [companyId, setCompanyId] = useState<number>(companies[0]?.id || 0);
  useEffect(() => { if (!companies.some((company) => company.id === companyId)) setCompanyId(companies[0]?.id || 0); }, [companies, companyId]);
  const selectedCompany = companies.find((company) => company.id === companyId);

  if (!companies.length) return <section className="workspace-state"><div><h3>No hay empresas registradas</h3><p>Crea primero una empresa para poder asignarle usuarios.</p></div></section>;

  return <section className="admin-company-users-module">
    <div className="admin-company-switcher"><span className="admin-company-switcher__icon"><Icon name="building" /></span><label><span>Empresa seleccionada</span><select value={companyId} onChange={(event) => setCompanyId(Number(event.target.value))}>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></label><p>Los usuarios que crees quedarán vinculados únicamente a esta empresa.</p></div>
    {selectedCompany ? <AdminCompanyTeamPanel key={selectedCompany.id} accessToken={accessToken} company={selectedCompany} /> : null}
  </section>;
}
