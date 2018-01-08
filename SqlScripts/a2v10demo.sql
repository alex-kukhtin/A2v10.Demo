/* 20180108-1000 */
/*
------------------------------------------------
Copyright © 2008-2018 Alex Kukhtin

Last updated : 08 jan 2018 12:30
module version : 1000
*/
------------------------------------------------
set noexec off;
go
------------------------------------------------
if DB_NAME() = N'master'
begin
	declare @err nvarchar(255);
	set @err = N'Error! Can not use the master database!';
	print @err;
	raiserror (@err, 16, -1) with nowait;
	set noexec on;
end
go
------------------------------------------------
set nocount on;
if not exists(select * from a2sys.Versions where Module = N'demo')
	insert into a2sys.Versions (Module, [Version]) values (N'demo', 1000);
else
	update a2sys.Versions set [Version] = 1000 where Module = N'demo';
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SCHEMATA where SCHEMA_NAME=N'a2demo')
begin
	exec sp_executesql N'create schema a2demo';
end
go
------------------------------------------------
-- Invoice
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Invoice.Index')
	drop procedure a2demo.[Invoice.Index]
go
------------------------------------------------
create procedure a2demo.[Invoice.Index]
@UserId bigint
as
begin
	set nocount on;
	select [Documents!TDocument!Array] = null
end
go
------------------------------------------------
begin
	-- App Title/SubTitle
	if not exists (select * from a2sys.SysParams where [Name] = N'AppTitle')
		insert into a2sys.SysParams([Name], StringValue) values (N'AppTitle', N'A2:Demo'); 
	if not exists (select * from a2sys.SysParams where [Name] = N'AppSubTitle')
		insert into a2sys.SysParams([Name], StringValue) values (N'AppSubTitle', N'демонстрационное приложение'); 
end
go
------------------------------------------------
begin
	-- create user menu
	declare @menu table(id bigint, p0 bigint, [name] nvarchar(255), [url] nvarchar(255), icon nvarchar(255), [order] int);
	insert into @menu(id, p0, [name], [url], icon, [order])
	values
		(1, null, N'Default',     null,         null,     0),
		(10, 1,   N'Продажи',     N'sales',	    null,     10),
		(11, 10,  N'Документы',   null,		    null,     10),
		(12, 10,  N'Справочники', null,		    null,     20),
		(20, 11,  N'Счета',		  N'invoice',   N'file',  10),
		(30, 12,  N'Покупатели',  N'customers', N'user',  10);
			
	merge a2ui.Menu as target
	using @menu as source
	on target.Id=source.id and target.Id >= 1 and target.Id < 200
	when matched then
		update set
			target.Id = source.id,
			target.[Name] = source.[name],
			target.[Url] = source.[url],
			target.[Icon] = source.icon,
			target.[Order] = source.[order]
	when not matched by target then
		insert(Id, Parent, [Name], [Url], Icon, [Order]) values (id, p0, [name], [url], icon, [order])
	when not matched by source and target.Id >= 1 and target.Id < 200 then 
		delete;

	if not exists (select * from a2security.Acl where [Object] = 'std:menu' and [ObjectId] = 1 and GroupId = 1)
	begin
		insert into a2security.Acl ([Object], ObjectId, GroupId, CanView)
			values (N'std:menu', 1, 1, 1);
	end
	exec a2security.[Permission.UpdateAcl.Menu];
end
go
------------------------------------------------
begin
	set nocount on;
	grant execute on schema ::a2demo to public;
end
go
------------------------------------------------
set noexec off;
go
