<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader/></template>

	<MkSpacer :contentMax="500">
		<div class="_gaps">
			<MkOfficialTag v-for="tag in official_tags" :key="tag.tag" :tagString="tag.tag"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { i18n } from '@/i18n.js';

const official_tags = [
	{
		tag: 'test',
	},
	{
		tag: 'aaaa',
	},
];

definePageMetadata(() => ({
	title: i18n.ts._official_tag.title,
	icon: 'ti ti-bookmarks',
}));
</script>

