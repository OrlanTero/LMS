<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class AnnouncementAbstract extends ModelDefaultFunctions
{
    public $announcement_id;

    public $user_id;

    public $for_view;

    public $title;

    public $content;

    public $status;

    public $date_created;
}