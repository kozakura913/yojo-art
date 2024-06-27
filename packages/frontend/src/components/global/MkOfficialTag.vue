<!--
SPDX-FileCopyrightText: syuilo and misskey-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkButton :class="$style.menuButton" @click="tagTL">{{ props.tagString }}</MkButton>
<div></div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { i18n } from '@/i18n.js';
import { url as local, host } from '@/config.js';
import MkButton from '@/components/MkButton.vue';
import * as os from '@/os.js';
import { $i } from '@/account.js';

const props = defineProps<{
	tagString: string;
}>();
const tagTL = () => {

};
</script>

<style lang="scss" module>

.menuButton {
	margin: 8px auto;
}
</style>
