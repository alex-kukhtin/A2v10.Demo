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
-- Tables
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2demo' and SEQUENCE_NAME=N'SQ_Agents')
	create sequence a2demo.SQ_Agents as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Agents')
begin
	create table a2demo.Agents
	(
		Id	bigint not null constraint PK_Agents primary key
			constraint DF_Agents_PK default(next value for a2demo.SQ_Agents),
		Kind nvarchar(255) null,
		Void bit not null
			constraint DF_Agents_Void default(0),
		Parent bigint null
			constraint FK_Agents_Parent_Agents foreign key references a2demo.Agents(Id),
		[Code] nvarchar(32) null,
		[Name] nvarchar(255) null,
		[Tag] nvarchar(255) null,
		[Memo] nvarchar(255) null,
		DateCreated datetime not null constraint DF_Agents_DateCreated default(getdate()),
		UserCreated bigint not null,
		DateModified datetime not null constraint DF_Agents_DateModified default(getdate()),
		UserModified bigint not null
	);
end
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.SEQUENCES where SEQUENCE_SCHEMA=N'a2demo' and SEQUENCE_NAME=N'SQ_Documents')
	create sequence a2demo.SQ_Documents as bigint start with 100 increment by 1;
go
------------------------------------------------
if not exists(select * from INFORMATION_SCHEMA.TABLES where TABLE_SCHEMA=N'a2demo' and TABLE_NAME=N'Documents')
begin
	create table a2demo.Documents
	(
		Id	   bigint not null constraint PK_Documents primary key
			constraint DF_Documents_PK default(next value for a2demo.SQ_Documents),
		Kind nvarchar(255) null,
		Parent bigint null
			constraint FK_Document_Parent_Documents foreign key references a2demo.Documents(Id),
		[Date] datetime null,
		[No]   int      null,
		Agent  bigint   null
			constraint FK_Document_Agent_Agents foreign key references a2demo.Agents(Id),
		[Sum] money not null 
			constraint DF_Documents_Sum default(0),
		[Tag]  nvarchar(255) null,
		[Memo] nvarchar(255) null,
		DateCreated datetime not null constraint DF_Documents_DateCreated default(getdate()),
		UserCreated bigint not null,
		DateModified datetime not null constraint DF_Documents_DateModified default(getdate()),
		UserModified bigint not null
	);
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Metadata')
	drop procedure a2demo.[Agent.Metadata]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Update')
	drop procedure a2demo.[Agent.Update]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Metadata')
	drop procedure a2demo.[Document.Metadata]
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Update')
	drop procedure a2demo.[Document.Update]
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2demo' and DOMAIN_NAME=N'Document.TableType' and DATA_TYPE=N'table type')
	drop type a2demo.[Document.TableType];
go
------------------------------------------------
create type a2demo.[Document.TableType]
as table(
	Id bigint null,
	Kind nvarchar(255),
	[Date] datetime,
	[No] int,
	[Sum] money,
	Agent bigint,
	[Memo] nvarchar(255)
)
go
------------------------------------------------
if exists(select * from INFORMATION_SCHEMA.DOMAINS where DOMAIN_SCHEMA=N'a2demo' and DOMAIN_NAME=N'Agent.TableType' and DATA_TYPE=N'table type')
	drop type a2demo.[Agent.TableType];
go
------------------------------------------------
create type a2demo.[Agent.TableType]
as table(
	Id bigint null,
	Kind nvarchar(255),
	[Name] nvarchar(255),
	Code nvarchar(32),
	[Memo] nvarchar(255)
)
go
------------------------------------------------
-- Document procedures
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Index')
	drop procedure a2demo.[Document.Index]
go
------------------------------------------------
create procedure a2demo.[Document.Index]
@UserId bigint,
@Kind nvarchar(255),
@Offset int = 0,
@PageSize int = 20,
@Order nvarchar(255) = N'Id',
@Dir nvarchar(20) = N'desc'
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = isnull(@Dir, @Asc);

	-- list of users
	with T([Id!!Id], [Date], [No], [Sum], Memo, [Agent.Id!TAgent!Id], [Agent.Name!TAgent!Name], [!!RowNumber])
	as(
		select d.Id, d.[Date], d.[No], d.[Sum], d.Memo, [Agent.Id!TAgent!Id] = d.Agent, [Agent.Name!TAgent!Name] = a.[Name],
			[!!RowNumber] = row_number() over (
			 order by
				case when @Order=N'Id' and @Dir = @Asc then d.Id end asc,
				case when @Order=N'Id' and @Dir = @Desc  then d.Id end desc,
				case when @Order=N'Date' and @Dir = @Asc then d.[Date] end asc,
				case when @Order=N'Date' and @Dir = @Desc  then d.[Date] end desc,
				case when @Order=N'No' and @Dir = @Asc then d.[No] end asc,
				case when @Order=N'No' and @Dir = @Desc then d.[No] end desc,
				case when @Order=N'Sum' and @Dir = @Asc then d.[Sum] end asc,
				case when @Order=N'Sum' and @Dir = @Desc then d.[Sum] end desc,
				case when @Order=N'Memo' and @Dir = @Asc then d.Memo end asc,
				case when @Order=N'Memo' and @Dir = @Desc then d.Memo end desc,
				case when @Order=N'Agent.Name' and @Dir = @Asc then a.[Name] end asc,
				case when @Order=N'Agent.Name' and @Dir = @Desc then a.[Name] end desc
			)
		from a2demo.Documents d
		left join a2demo.Agents a on d.Agent = a.Id
		where d.Kind=@Kind
	)
	select [Documents!TDocument!Array]=null, *, [!!RowCount] = (select count(1) from T)
	from T
		where [!!RowNumber] > @Offset and [!!RowNumber] <= @Offset + @PageSize
	order by [!!RowNumber];

	select [!$System!] = null, [!!PageSize] = 20;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Load')
	drop procedure a2demo.[Document.Load]
go
------------------------------------------------
create procedure a2demo.[Document.Load]
@UserId bigint,
@Id bigint = null
as
begin
	set nocount on;
	select [Document!TDocument!Object] = null, [Id!!Id] = Id, Kind, [Date], [No], [Sum], Tag, Memo,
		[Agent!TAgent!RefId] = Agent,
		DateCreated, DateModified,
		[Rows!TRow!Array] = null
	from a2demo.Documents 
	where Id=@Id;

	/*
	select [!TRow!Array] = null, [Id!!Id] = Id, [!Document.Rows!ParentId] 
	from a2demo.DocDetails where Document = @Id;
	*/

	select [!TAgent!Map] = null, [Id!!Id] = a.Id,  [Name!!Name] = a.[Name], a.Code 
	from a2demo.Agents a 
		inner join a2demo.Documents d on a.Id = d.Agent;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Metadata')
	drop procedure a2demo.[Document.Metadata]
go
------------------------------------------------
create procedure a2demo.[Document.Metadata]
as
begin
	set nocount on;
	declare @Document a2demo.[Document.TableType];
	select [Document!Document!Metadata]=null, * from @Document;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Document.Update')
	drop procedure a2demo.[Document.Update]
go
------------------------------------------------
create procedure a2demo.[Document.Update]
@UserId bigint,
@Document a2demo.[Document.TableType] readonly,
@RetId bigint = null output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;


	declare @output table(op sysname, id bigint);

	merge a2demo.Documents as target
	using @Document as source
	on (target.Id = source.Id)
	when matched then
		update set 
			target.[Date] = source.[Date],
			target.[No] = source.[No],
			target.[Sum] = source.[Sum],
			target.[Memo] = source.Memo,
			target.[Agent] = source.Agent,
			target.[DateModified] = getdate(),
			target.[UserModified] = @UserId
	when not matched by target then 
		insert (Kind, [Date], [No], [Sum], Memo, Agent, UserCreated, UserModified)
		values (Kind, [Date], [No], [Sum], Memo, Agent, @UserId, @UserId)
	output 
		$action op,
		inserted.Id id
	into @output(op, id);

	-- todo: log
	select top(1) @RetId = id from @output;

	exec a2demo.[Document.Load] @UserId, @RetId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Index')
	drop procedure a2demo.[Agent.Index]
go
------------------------------------------------
create procedure a2demo.[Agent.Index]
@UserId bigint,
@Kind nvarchar(255),
@Offset int = 0,
@PageSize int = 20,
@Order nvarchar(255) = N'Id',
@Dir nvarchar(20) = N'desc',
@Fragment nvarchar(255) = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;

	declare @Asc nvarchar(10), @Desc nvarchar(10), @RowCount int;
	set @Asc = N'asc'; set @Desc = N'desc';
	set @Dir = isnull(@Dir, @Asc);

	if @Fragment is not null
		set @Fragment = N'%' + upper(@Fragment) + N'%';

	-- list of users
	with T([Id!!Id], [Name], Code, Memo, [!!RowNumber])
	as(
		select a.Id, a.[Name], Code, a.Memo,
			[!!RowNumber] = row_number() over (
			 order by
				case when @Order=N'Id' and @Dir = @Asc then a.Id end asc,
				case when @Order=N'Id' and @Dir = @Desc  then a.Id end desc,
				case when @Order=N'Name' and @Dir = @Asc then a.[Name] end asc,
				case when @Order=N'Name' and @Dir = @Desc then a.[Name] end desc,
				case when @Order=N'Code' and @Dir = @Asc then a.[Code] end asc,
				case when @Order=N'Code' and @Dir = @Desc then a.[Code] end desc,
				case when @Order=N'Memo' and @Dir = @Asc then a.Memo end asc,
				case when @Order=N'Memo' and @Dir = @Desc then a.Memo end desc
			)
		from a2demo.Agents a
		where a.Kind=@Kind and a.Void = 0
		and (@Fragment is null or upper(a.[Name]) like @Fragment or upper(a.[Code]) like @Fragment
			or upper(a.Memo) like @Fragment or cast(a.Id as nvarchar) like @Fragment)
	)
	select [Agents!TAgent!Array]=null, *, [!!RowCount] = (select count(1) from T)
	from T
		where [!!RowNumber] > @Offset and [!!RowNumber] <= @Offset + @PageSize
	order by [!!RowNumber];

	select [!$System!] = null, [!!PageSize] = 20;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Load')
	drop procedure a2demo.[Agent.Load]
go
------------------------------------------------
create procedure a2demo.[Agent.Load]
@UserId bigint,
@Id bigint = null
as
begin
	set nocount on;
	set transaction isolation level read uncommitted;
	select [Agent!TAgent!Object] = null, [Id!!Id] = Id, [Name!!Name] = [Name], Code, Tag, Memo,
		DateCreated, DateModified
	from a2demo.Agents where Id=@Id and Void=0;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Agent.Metadata')
	drop procedure a2demo.[Agent.Metadata]
go
------------------------------------------------
create procedure a2demo.[Agent.Metadata]
as
begin
	set nocount on;
	declare @Agent a2demo.[Agent.TableType];
	select [Agent!Agent!Metadata]=null, * from @Agent;
end
go
------------------------------------------------
create procedure a2demo.[Agent.Update]
@UserId bigint,
@Agent a2demo.[Agent.TableType] readonly,
@RetId bigint = null output
as
begin
	set nocount on;
	set transaction isolation level read committed;
	set xact_abort on;


	declare @output table(op sysname, id bigint);

	merge a2demo.Agents as target
	using @Agent as source
	on (target.Id = source.Id)
	when matched then
		update set 
			target.[Name] = source.[Name],
			target.[Code] = source.[Code],
			target.[Memo] = source.Memo,
			target.[DateModified] = getdate(),
			target.[UserModified] = @UserId
	when not matched by target then 
		insert (Kind, [Name], [Code], Memo, UserCreated, UserModified)
		values (Kind, [Name], [Code], Memo, @UserId, @UserId)
	output 
		$action op,
		inserted.Id id
	into @output(op, id);

	-- todo: log
	select top(1) @RetId = id from @output;

	exec a2demo.[Agent.Load] @UserId, @RetId;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Invoice.Index')
	drop procedure a2demo.[Invoice.Index]
go
------------------------------------------------
create procedure a2demo.[Invoice.Index]
@UserId bigint,
@Offset int = 0,
@PageSize int = 20,
@Order nvarchar(255) = N'Id',
@Dir nvarchar(20) = N'desc'
as
begin
	set nocount on;
	exec a2demo.[Document.Index] @UserId=@UserId, @Kind=N'Invoice', @Offset=@Offset, @PageSize=@PageSize, @Order=@Order, @Dir=@Dir;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Waybill.Index')
	drop procedure a2demo.[Waybill.Index]
go
------------------------------------------------
create procedure a2demo.[Waybill.Index]
@UserId bigint,
@Offset int = 0,
@PageSize int = 20,
@Order nvarchar(255) = N'Id',
@Dir nvarchar(20) = N'desc'
as
begin
	set nocount on;
	exec a2demo.[Document.Index] @UserId=@UserId, @Kind=N'Waybill', @Offset=@Offset, @PageSize=@PageSize, @Order=@Order, @Dir=@Dir;
end
go
------------------------------------------------
if exists (select * from INFORMATION_SCHEMA.ROUTINES where ROUTINE_SCHEMA=N'a2demo' and ROUTINE_NAME=N'Customer.Index')
	drop procedure a2demo.[Customer.Index]
go
------------------------------------------------
create procedure a2demo.[Customer.Index]
@UserId bigint,
@Id bigint = null,
@Offset int = 0,
@PageSize int = 20,
@Order nvarchar(255) = N'Id',
@Dir nvarchar(20) = N'desc',
@Fragment nvarchar(255) = null
as
begin
	set nocount on;
	exec a2demo.[Agent.Index] @UserId=@UserId, @Kind=N'Customer', 
	@Offset=@Offset, @PageSize=@PageSize, @Order=@Order, @Dir=@Dir,
	@Fragment = @Fragment
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
		(1, null, N'Default',     null,          null,     0),
		(10, 1,   N'Продажи',     N'sales',	     null,     10),
		(20, 1,   N'Закупки',     N'purchase',	 null,     20),
		(31, 10,  N'Документы',   null,		     null,     10),
		(32, 10,  N'Справочники', null,		     null,     20),
		(33, 20,  N'Документы',   null,		     null,     10),
		(34, 20,  N'Справочники', null,		     null,     20),
		(41, 31,  N'Счета',		  N'invoice',    N'file',  10),
		(42, 31,  N'Накладные',	  N'waybill',    N'file',  20),
		(43, 32,  N'Покупатели',  N'customer',   N'user',  10),
		(44, 33,  N'Накладные',	  N'waybillin',  N'file',  10),
		(45, 34,  N'Поставщики',  N'supplier',   N'user',  10),
		(46, 34,  N'Товары',      N'good',       N'steps', 20);
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
