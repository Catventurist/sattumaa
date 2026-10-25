<script setup lang="ts">
const { t } = useI18n()
const rating = ref(0)

const labels = computed(() => [
  t('warmRating.poor'),
  t('warmRating.fair'),
  t('warmRating.good'),
  t('warmRating.great'),
  t('warmRating.superb')
])
</script>

<template>
  <SWarmRating
    :value="rating"
    :count="5"
    shape="heart"
    color="warning"
    :labels="labels"
    :size="40"
    :lift="8"
    :magnify="1.15"
    :rise-duration="320"
    :pop-scale="1.3"
    show-tip
    allow-clear
    @change="next => (rating = next)"
  />
</template>
