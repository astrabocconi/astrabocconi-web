-- Representative photos currently point at cdn.astrabocconi.com, which no
-- longer resolves (NXDOMAIN), and the bucket they referenced does not exist on
-- this project. All sixteen are dead links, so the backoffice needs to be able
-- to upload replacements. The `images` bucket already exists and is public.

begin;

drop policy if exists images_objects_read on storage.objects;
create policy images_objects_read
  on storage.objects for select to authenticated
  using (bucket_id = 'images');

drop policy if exists images_objects_write on storage.objects;
create policy images_objects_write
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'images'
    and (select private.has_permission('representatives:write'))
  );

drop policy if exists images_objects_update on storage.objects;
create policy images_objects_update
  on storage.objects for update to authenticated
  using (
    bucket_id = 'images'
    and (select private.has_permission('representatives:write'))
  );

drop policy if exists images_objects_delete on storage.objects;
create policy images_objects_delete
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'images'
    and (select private.has_permission('representatives:delete'))
  );

commit;
