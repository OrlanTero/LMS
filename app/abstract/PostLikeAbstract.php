<?php

namespace Application\abstract;

use Application\abstract\ModelDefaultFunctions;

abstract class PostLikeAbstract extends ModelDefaultFunctions
{
    public $post_like_id;

    public $post_id;

    public $user_id;

    public $date_created;

    public $status;
}