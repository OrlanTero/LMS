<?php


namespace Application\models;

use Application\abstract\AnnouncementAbstract;

class Announcement extends AnnouncementAbstract
{
    public function __construct($data = [])
    {
        $this->applyData($data, AnnouncementAbstract::class);
        $this->init();
    }

    private function init(): void
    {

    }
}